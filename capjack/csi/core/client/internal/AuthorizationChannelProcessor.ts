import {ChannelGate} from '../ChannelGate'
import {ConnectionAcceptor} from '../ConnectionAcceptor'
import {TemporalAssistant} from '../../../../tool/utils/assistant/TemporalAssistant'
import {ObjectPool} from '../../../../tool/utils/pool/ObjectPool'
import {ByteBuffer} from '../../../../tool/io/ByteBuffer'
import {InternalChannelProcessor} from '../../internal/InternalChannelProcessor'
import {InternalChannel} from '../../internal/InternalChannel'
import {InputByteBuffer} from '../../../../tool/io/InputByteBuffer'
import {ChannelInputProcess, ChannelInputProcessSwitch} from '../../internal/ChannelInputProcess'
import {ProtocolMarker} from '../../internal/ProtocolMarker'
import {ClientConnectionImpl} from './ClientConnectionImpl'
import {AuthorizationConnectionProcessor} from './AuthorizationConnectionProcessor'
import {ConnectFailReason} from '../ConnectFailReason'
import {NothingConnectionAcceptor} from './NothingConnectionAcceptor'

export class AuthorizationChannelProcessor implements InternalChannelProcessor {
	constructor(
		private readonly assistant: TemporalAssistant,
		private readonly buffers: ObjectPool<ByteBuffer>,
		private readonly gate: ChannelGate,
		private acceptor: ConnectionAcceptor) {}
	
	processChannelInput(channel: InternalChannel, buffer: InputByteBuffer): ChannelInputProcess {
		let marker = buffer.readByte()
		
		if (marker == ProtocolMarker.AUTHORIZATION) {
			if (buffer.isReadable(8 + 4)) {
				let connectionId = buffer.readLong()
				let activityTimeoutSeconds = buffer.readInt()
				let connection = new ClientConnectionImpl(
					connectionId,
					channel,
					new AuthorizationConnectionProcessor(this.assistant, this.buffers, activityTimeoutSeconds, this.acceptor, this.gate),
					this.assistant,
					this.buffers
				)
				connection.logger.trace(`Established (activity timeout ${activityTimeoutSeconds} sec)`)
				
				this.acceptor = new NothingConnectionAcceptor()
				connection.accept()
				return new ChannelInputProcessSwitch(connection, activityTimeoutSeconds * 2)
			}
			
			buffer.backRead(1)
		}
		else {
			switch (marker) {
				case ProtocolMarker.SERVER_CLOSE_VERSION:
					this.failAndClose(ConnectFailReason.VERSION, channel)
					break
				case ProtocolMarker.SERVER_CLOSE_AUTHORIZATION:
					this.failAndClose(ConnectFailReason.AUTHORIZATION, channel)
					break
				case ProtocolMarker.SERVER_CLOSE_SHUTDOWN:
					this.failAndClose(ConnectFailReason.REFUSED, channel)
					break
				case ProtocolMarker.CLOSE_DEFINITELY:
					this.failAndClose(ConnectFailReason.REFUSED, channel)
					break
				case ProtocolMarker.CLOSE_ERROR:
					this.failAndClose(ConnectFailReason.ERROR, channel)
					break
				case ProtocolMarker.CLOSE_PROTOCOL_BROKEN:
					this.failAndClose(ConnectFailReason.ERROR, channel)
					break
				case ProtocolMarker.SERVER_CLOSE_CONCURRENT:
					this.failAndClose(ConnectFailReason.REFUSED, channel)
					break
				case ProtocolMarker.SERVER_SHUTDOWN_TIMEOUT:
					this.failAndCloseWithMarker(ConnectFailReason.REFUSED, channel, ProtocolMarker.CLOSE_DEFINITELY)
					break
				default:
					this.failAndCloseWithMarker(ConnectFailReason.ERROR, channel, ProtocolMarker.CLOSE_PROTOCOL_BROKEN)
			}
		}
		
		return ChannelInputProcess.BREAK
	}
	
	processChannelClose(channel: InternalChannel, interrupted: Boolean) {
		if (interrupted) {
			this.fail(ConnectFailReason.REFUSED)
		}
	}
	
	private fail(reason: ConnectFailReason) {
		let a = this.acceptor
		this.acceptor = new NothingConnectionAcceptor()
		a.acceptFail(reason)
	}
	
	private failAndClose(reason: ConnectFailReason, channel: InternalChannel) {
		this.fail(reason)
		channel.close()
	}
	
	private failAndCloseWithMarker(reason: ConnectFailReason, channel: InternalChannel, marker: number) {
		this.fail(reason)
		channel.closeWithMarker(marker)
	}
}

