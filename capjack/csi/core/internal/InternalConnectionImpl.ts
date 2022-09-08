import {InternalConnection} from './InternalConnection'
import {Long} from '../../../tool/lang/Long'
import {InternalChannel} from './InternalChannel'
import {InternalConnectionProcessor} from './InternalConnectionProcessor'
import {ByteBuffer} from '../../../tool/io/ByteBuffer'
import {ObjectPool} from '../../../tool/utils/pool/ObjectPool'
import {TemporalAssistant} from '../../../tool/utils/assistant/TemporalAssistant'
import {Logger} from '../../../tool/logging/Logger'
import {PrefixMessageTransformerLogger} from '../../../tool/logging/PrefixMessageTransformerLogger'
import {Logging} from '../../../tool/logging/Logging'
import {Messages} from './Messages'
import {InputByteBuffer} from '../../../tool/io/InputByteBuffer'
import {formatLoggerMessageBytesBuffer} from './_logging_csi_core'
import {OutgoingMessage} from './OutgoingMessage'
import {ProtocolMarker} from './ProtocolMarker'
import {ChannelInputProcess} from './ChannelInputProcess'
import {NothingConnectionProcessor} from './NothingConnectionProcessor'
import {NothingInternalChannel} from './NothingInternalChannel'
import {extractError} from '../../../tool/lang/_errors'
import {ProtocolBrokenException} from '../ProtocolBrokenException'

export class InternalConnectionImpl implements InternalConnection {
	public readonly logger: Logger
	public readonly messages: Messages
	private opened: boolean = true
	
	constructor(
		public readonly id: Long,
		private channel: InternalChannel,
		private processor: InternalConnectionProcessor,
		private assistant: TemporalAssistant,
		buffers: ObjectPool<ByteBuffer>,
		public readonly loggingName: string
	) {
		this.logger = new PrefixMessageTransformerLogger(Logging.getLogger('capjack.csi.core.internal.InternalConnectionImpl'), `[${loggingName}] `)
		this.messages = new Messages(buffers)
	}
	
	accept() {
		this.logger.trace('Schedule accept')
		this.assistant.execute(() => {
			if (this.opened) {
				this.logger.trace(`Accept successful on channel ${this.channel.id}`)
				this.useProcessor(this.processor.processConnectionAccept(this.channel, this))
			}
			else {
				this.logger.trace('Accept failed on closed connection')
			}
		})
	}
	
	recovery(channel: InternalChannel, lastSentMessageId: number) {
		this.logger.trace(`Schedule recovery on channel ${channel.id}`)
		this.assistant.execute(() => {
			if (this.opened) {
				
				this.logger.trace(`Recovery successful on channel ${channel.id}`)
				
				let prevChannel = this.channel
				this.channel = channel
				
				prevChannel.closeWithMarker(ProtocolMarker.CLOSE_DEFINITELY)
				
				this.useProcessor(this.processor.processConnectionRecovery(channel))
				
				this.messages.outgoing.clearTo(lastSentMessageId)
				this.messages.outgoing.iterate(this.doSend.bind(this))
			}
			else {
				this.logger.trace('Recovery failed on closed connection')
				channel.closeWithMarker(ProtocolMarker.CLOSE_DEFINITELY)
			}
		})
	}
	
	send(message: InputByteBuffer) {
		if (this.opened) {
			this.doSend(this.messages.outgoing.add(message))
		}
		else {
			this.logger.trace(`Skip send, because connection closed`)
			message.skipReadFully()
		}
	}
	
	close() {
		this.closeWithMarker(ProtocolMarker.CLOSE_DEFINITELY)
	}
	
	closeDueError() {
		this.closeWithMarker(ProtocolMarker.CLOSE_ERROR)
	}
	
	closeWithMarker(marker: number) {
		if (this.opened) {
			this.sendLastReceivedMessageIfNeeded()
			
			this.logger.trace(`Close with marker ${ProtocolMarker.toString(marker)}`)
			
			let c = this.channel
			this.terminate()
			c.closeWithMarker(marker)
		}
		else {
			this.logger.trace(`Skip close, because connection closed`)
		}
	}
	
	processChannelInput(channel: InternalChannel, buffer: InputByteBuffer): ChannelInputProcess {
		if (this.channel != channel) {
			this.logger.trace(`Process input skipped with wrong channel`)
			return ChannelInputProcess.BREAK
		}
		
		let success = true
		
		while (success && this.opened && buffer.readable) {
			try {
				success = this.processor.processChannelInput(channel, buffer)
			}
			catch (e) {
				this.handleError(extractError(e))
				return ChannelInputProcess.BREAK
			}
		}
		
		if (this.opened) {
			this.sendLastReceivedMessageIfNeeded()
		}
		
		return (success && this.opened) ? ChannelInputProcess.CONTINUE : ChannelInputProcess.BREAK
	}
	
	processChannelClose(channel: InternalChannel, interrupted: Boolean) {
		if (this.opened) {
			this.logger.trace(`Process channel ${channel.id} close ${interrupted ? 'interrupted' : 'definitely'}`)
			if (this.channel == channel) {
				if (interrupted) {
					this.useProcessor(this.processor.processChannelInterrupt(this))
				}
				else {
					this.logger.debug('Close definitely')
					this.terminate()
				}
			}
			else {
				this.logger.trace('Skip process close channel with wrong channel')
			}
			
		}
		else {
			this.logger.trace(`Skip process close channel ${channel.id}, because connection closed`)
		}
	}
	
	private sendLastReceivedMessageIfNeeded() {
		if (this.messages.incoming.changed) {
			if (this.logger.traceEnabled) this.logger.trace(`Send received message id ${this.messages.incoming.id}`)
			this.channel.writeArray(this.messages.incoming.makeMessage())
		}
	}
	
	private doSend(message: OutgoingMessage) {
		if (this.logger.traceEnabled) this.logger.trace(formatLoggerMessageBytesBuffer(`Send message id ${message.id}`, message.data))
		this.channel.write(message.data)
	}
	
	private useProcessor(processor: InternalConnectionProcessor) {
		if (this.processor != processor) {
			if (this.opened) {
				this.processor = processor
			}
			else {
				processor.processConnectionClose()
			}
		}
	}
	
	private terminate() {
		this.opened = false
		let p = this.processor
		
		this.processor = new NothingConnectionProcessor()
		this.channel = new NothingInternalChannel(this.channel.id)
		this.messages.outgoing.dispose()
		
		p.processConnectionClose()
	}
	
	private handleError(e: Error) {
		let marker
		
		if (e instanceof ProtocolBrokenException) {
			this.logger.warn('Protocol broken', e)
			marker = ProtocolMarker.CLOSE_PROTOCOL_BROKEN
		}
		else {
			this.logger.error('Uncaught exception', e)
			marker = ProtocolMarker.CLOSE_ERROR
		}
		
		if (this.opened) {
			this.closeWithMarker(marker)
		}
	}
}