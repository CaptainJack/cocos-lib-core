import {TemporalAssistant} from '../../../../tool/utils/assistant/TemporalAssistant'
import {ObjectPool} from '../../../../tool/utils/pool/ObjectPool'
import {ByteBuffer} from '../../../../tool/io/ByteBuffer'
import {ChannelGate} from '../ChannelGate'
import {ConnectionHandler} from '../ConnectionHandler'
import {Messages} from '../../internal/Messages'
import {Logger} from '../../../../tool/logging/Logger'
import {MessagingConnectionProcessor} from '../../internal/MessagingConnectionProcessor'
import {Cancelable} from '../../../../tool/utils/Cancelable'
import {ProtocolMarker} from '../../internal/ProtocolMarker'
import {InternalChannel} from '../../internal/InternalChannel'
import {InternalConnectionProcessor} from '../../internal/InternalConnectionProcessor'
import {InternalConnection} from '../../internal/InternalConnection'
import {RecoveryConnectionProcessor} from './RecoveryConnectionProcessor'
import {NothingConnectionHandler} from './NothingConnectionHandler'
import {Channel} from '../../Channel'
import {InputByteBuffer} from '../../../../tool/io/InputByteBuffer'

export class ClientMessagingConnectionProcessor extends MessagingConnectionProcessor<ConnectionHandler> {
	
	private pinger = Cancelable.DUMMY
	
	constructor(
		handler: ConnectionHandler,
		messages: Messages,
		logger: Logger,
		private assistant: TemporalAssistant,
		private buffers: ObjectPool<ByteBuffer>,
		private activityTimeoutSeconds: number,
		private gate: ChannelGate,
		channel: InternalChannel
	) {
		super(handler, messages, logger)
		this.startPinger(channel)
	}
	
	processChannelInterrupt(connection: InternalConnection): InternalConnectionProcessor {
		this.stopPinger()
		let recoveryHandler = this.handler.handleConnectionLost()
		return new RecoveryConnectionProcessor(this, recoveryHandler, this.assistant, this.buffers, this.gate, connection, this.activityTimeoutSeconds, this.lastIncomingMessageId)
	}
	
	protected processChannelInputMarker(channel: Channel, buffer: InputByteBuffer, marker: number): boolean {
		switch (marker) {
			case ProtocolMarker.MESSAGING_PING:
				return true
			
			case ProtocolMarker.SERVER_CLOSE_SHUTDOWN:
				this.logger.debug('Close by server shutdown')
				channel.close()
				return false
			
			case ProtocolMarker.SERVER_CLOSE_CONCURRENT:
				this.logger.debug('Close by server concurrent')
				channel.close()
				return false
			
			case ProtocolMarker.SERVER_SHUTDOWN_TIMEOUT:
				if (buffer.isReadable(4)) {
					let shutdownTimeoutSeconds = buffer.readInt()
					this.handler.handleConnectionCloseTimeout(shutdownTimeoutSeconds)
					return true
				}
				buffer.backRead(1)
				return false
			
			default:
				return super.processChannelInputMarker(channel, buffer, marker)
		}
	}
	
	protected doProcessConnectionRecovery(channel: InternalChannel): InternalConnectionProcessor {
		this.startPinger(channel)
		return this
	}
	
	protected doProcessConnectionClose(): ConnectionHandler {
		this.stopPinger()
		return new NothingConnectionHandler()
	}
	
	private startPinger(channel: InternalChannel) {
		this.stopPinger()
		this.pinger = this.assistant.repeat(this.activityTimeoutSeconds * 1000, () => {
			channel.writeByte(ProtocolMarker.MESSAGING_PING)
		})
	}
	
	private stopPinger() {
		this.pinger.cancel()
		this.pinger = Cancelable.DUMMY
	}
}