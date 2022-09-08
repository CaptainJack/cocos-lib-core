import {InternalChannel} from './InternalChannel'
import {ChannelHandler} from '../ChannelHandler'
import {ByteBuffer} from '../../../tool/io/ByteBuffer'
import {ObjectPool} from '../../../tool/utils/pool/ObjectPool'
import {InternalChannelProcessor} from './InternalChannelProcessor'
import {Channel} from '../Channel'
import {TemporalAssistant} from '../../../tool/utils/assistant/TemporalAssistant'
import {InputByteBuffer} from '../../../tool/io/InputByteBuffer'
import {Logger} from '../../../tool/logging/Logger'
import {Logging} from '../../../tool/logging/Logging'
import {PrefixMessageTransformerLogger} from '../../../tool/logging/PrefixMessageTransformerLogger'
import {IllegalStateException} from '../../../tool/lang/exceptions/IllegalStateException'
import {LivingWorker} from '../../../tool/utils/worker/LivingWorker'
import {ProtocolBrokenException} from '../ProtocolBrokenException'
import {ProtocolMarker} from './ProtocolMarker'
import {formatLoggerMessageBytesArray, formatLoggerMessageBytesBuffer, formatLoggerMessageBytesByte} from './_logging_csi_core'
import {Cancelable} from '../../../tool/utils/Cancelable'
import {ChannelInputProcess, ChannelInputProcessSwitch} from './ChannelInputProcess'
import {NothingChannelProcessor} from './NothingChannelProcessor'
import {NothingChannel} from './NothingChannel'
import {DummyByteBuffer} from '../../../tool/io/DummyByteBuffer'
import {NothingByteBufferPool} from './NothingByteBufferPool'
import {NothingTemporalAssistant} from './NothingTemporalAssistant'

export abstract class InternalChannelImpl implements InternalChannel, ChannelHandler {
	private readonly logger: Logger
	private readonly worker: LivingWorker
	
	private inputBuffer: ByteBuffer
	private outputBuffer: ByteBuffer
	
	private active: boolean = true
	private checkActivityTimer: Cancelable
	private checkActivityFn: () => void = this.syncCheckActivity.bind(this)
	
	private writeScheduled: boolean = false
	private writeFn: () => void = this.syncWrite.bind(this)
	
	private readScheduled: boolean = false
	private readFn: () => void = this.syncRead.bind(this)
	
	constructor(
		private channel: Channel,
		private processor: InternalChannelProcessor,
		private buffers: ObjectPool<ByteBuffer>,
		private assistant: TemporalAssistant,
		activityTimeoutSeconds: number
	) {
		this.logger = new PrefixMessageTransformerLogger(Logging.getLogger('capjack.csi.core.internal.InternalChannelImpl'), `[${this.channel.id}] `)
		this.worker = new LivingWorker(assistant, this.syncHandleError.bind(this))
		this.inputBuffer = buffers.take()
		this.outputBuffer = buffers.take()
		
		this.checkActivityTimer = assistant.repeat(activityTimeoutSeconds * 1000, this.checkActivity.bind(this))
	}
	
	get id(): number {
		return this.channel.id
	}
	
	get opened(): boolean {
		return this.worker.alive
	}
	
	write(data: InputByteBuffer): void {
		if (this.opened) {
			if (this.logger.traceEnabled) this.logger.trace(formatLoggerMessageBytesBuffer('Schedule write', data))
			
			this.outputBuffer.writeBuffer(data)
			if (!this.writeScheduled) {
				this.writeScheduled = true
				this.worker.defer(this.writeFn)
			}
		}
		else {
			this.logger.trace(`Skip write, because channel closed`)
			
			data.skipReadFully()
		}
	}
	
	writeArray(data: Int8Array): void {
		if (this.opened) {
			if (this.logger.traceEnabled) this.logger.trace(formatLoggerMessageBytesArray('Schedule write', data))
			
			this.outputBuffer.writeArrayFully(data)
			if (!this.writeScheduled) {
				this.writeScheduled = true
				this.worker.defer(this.writeFn)
			}
		}
		else {
			this.logger.trace(`Skip write, because channel closed`)
		}
	}
	
	writeByte(data: number): void {
		if (this.opened) {
			if (this.logger.traceEnabled) this.logger.trace(formatLoggerMessageBytesByte('Schedule write', data))
			
			this.outputBuffer.writeByte(data)
			if (!this.writeScheduled) {
				this.writeScheduled = true
				this.worker.defer(this.writeFn)
			}
		}
		else {
			this.logger.trace(`Skip write, because channel closed`)
		}
	}
	
	close(): void {
		if (this.opened) {
			if (this.worker.working) {
				this.syncClose(false)
			}
			else {
				this.logger.trace(`Schedule close`)
				this.worker.defer(() => {
					if (this.opened) this.syncClose(false)
				})
			}
		}
		else {
			this.logger.trace(`Skip close, because channel closed`)
		}
	}
	
	closeWithMarker(marker: number) {
		if (this.opened) {
			if (this.worker.working) {
				this.logger.trace(`Close with marker ${ProtocolMarker.toString(marker)}`)
				this.outputBuffer.writeByte(marker)
				this.syncClose(false)
			}
			else {
				this.logger.trace(`Schedule close with marker ${ProtocolMarker.toString(marker)}`)
				this.worker.defer(() => this.closeWithMarker(marker))
			}
		}
		else {
			this.logger.trace(`Skip close with marker ${ProtocolMarker.toString(marker)}, because channel closed`)
		}
	}
	
	handleChannelClose(): void {
		if (this.opened) {
			this.logger.trace('Handle channel close')
			
			this.worker.execute(() => {
				if (this.opened) this.syncClose(true)
			})
		}
		else {
			this.logger.trace(`Skip handle close, because channel closed`)
		}
	}
	
	handleChannelInput(data: InputByteBuffer): void {
		if (this.opened) {
			if (this.logger.traceEnabled) this.logger.trace(formatLoggerMessageBytesBuffer('Handle input', data))
			
			this.active = true
			this.inputBuffer.writeBuffer(data)
			if (!this.readScheduled) {
				this.readScheduled = true
				this.worker.defer(this.readFn)
			}
		}
		else {
			this.logger.trace(`Skip handle input, because channel closed`)
		}
	}
	
	private syncRead() {
		this.readScheduled = false
		if (this.opened && this.inputBuffer.readable) {
			if (this.logger.traceEnabled) this.logger.trace(formatLoggerMessageBytesBuffer('Read', this.inputBuffer))
			
			while (this.opened && this.inputBuffer.readable) {
				let process = this.processor.processChannelInput(this, this.inputBuffer)
				if (process == ChannelInputProcess.CONTINUE) {
					continue
				}
				if (process == ChannelInputProcess.BREAK) {
					this.inputBuffer.flush()
					break
				}
				// else if (process instanceof ChannelInputProcessSwitch)
				let s = process as ChannelInputProcessSwitch
				this.processor = s.processor
				if (s.activityTimeoutSeconds != 0) {
					this.checkActivityTimer.cancel()
					this.checkActivityTimer = this.assistant.repeat(s.activityTimeoutSeconds * 1000, this.checkActivity.bind(this))
				}
			}
		}
	}
	
	private checkActivity() {
		if (this.opened) {
			this.worker.execute(this.checkActivityFn)
		}
	}
	
	private syncCheckActivity() {
		if (this.active) {
			this.active = false
		}
		else {
			this.logger.debug('Activity timeout expired')
			this.checkActivityTimer.cancel()
			this.outputBuffer.writeByte(ProtocolMarker.CLOSE_ACTIVITY_TIMEOUT)
			this.syncClose(true)
		}
	}
	
	private syncWrite() {
		this.writeScheduled = false
		if (this.opened && this.outputBuffer.readable) {
			if (this.logger.traceEnabled) this.logger.trace(formatLoggerMessageBytesBuffer('Write', this.outputBuffer))
			
			this.channel.write(this.outputBuffer)
			
			if (this.outputBuffer.readable) {
				throw new IllegalStateException('Output buffer must be read in full')
			}
			this.outputBuffer.clear()
		}
	}
	
	private syncClose(interrupted: Boolean) {
		this.syncWrite()
		
		this.logger.debug(`Close ${interrupted ? 'interrupted' : 'definitely'}`)
		
		this.worker.die()
		
		let p = this.processor
		
		this.processor = new NothingChannelProcessor()
		
		this.checkActivityTimer.cancel()
		this.channel.close()
		this.buffers.back(this.inputBuffer)
		this.buffers.back(this.outputBuffer)
		
		this.checkActivityTimer = Cancelable.DUMMY
		this.channel = new NothingChannel(this.channel.id)
		this.inputBuffer = DummyByteBuffer.INSTANCE
		this.outputBuffer = DummyByteBuffer.INSTANCE
		this.buffers = new NothingByteBufferPool()
		this.assistant = new NothingTemporalAssistant()
		
		p.processChannelClose(this, interrupted)
	}
	
	private syncHandleError(e: Error) {
		if (e instanceof ProtocolBrokenException) {
			this.logger.warn('Protocol broken', e)
			this.closeWithMarker(ProtocolMarker.CLOSE_PROTOCOL_BROKEN)
		}
		else {
			this.logger.error('Uncaught exception', e)
			this.closeWithMarker(ProtocolMarker.CLOSE_ERROR)
		}
	}
}