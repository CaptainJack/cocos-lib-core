import {ChannelAcceptor} from '../ChannelAcceptor'
import {ChannelGate} from '../ChannelGate'
import {ConnectionAcceptor} from '../ConnectionAcceptor'
import {ConnectFailReason} from '../ConnectFailReason'
import {AuthorizationChannelProcessor} from './AuthorizationChannelProcessor'
import {TemporalAssistant} from '../../../../tool/utils/assistant/TemporalAssistant'
import {ObjectPool} from '../../../../tool/utils/pool/ObjectPool'
import {ByteBuffer} from '../../../../tool/io/ByteBuffer'
import {Channel} from '../../Channel'
import {ChannelHandler} from '../../ChannelHandler'
import {ClientChannelImpl} from './ClientChannelImpl'
import {ProtocolMarker} from '../../internal/ProtocolMarker'

export class AuthorizationChannelAcceptor implements ChannelAcceptor {
	constructor(
		private readonly assistant: TemporalAssistant,
		private readonly buffers: ObjectPool<ByteBuffer>,
		private readonly gate: ChannelGate,
		private readonly version: number,
		private readonly authorizationKey: Int8Array,
		private readonly acceptor: ConnectionAcceptor,
		private readonly authorizationTimeoutSeconds: number
	) {
	}
	
	acceptChannel(channel: Channel): ChannelHandler {
		let clientChannel = new ClientChannelImpl(
			channel,
			new AuthorizationChannelProcessor(this.assistant, this.buffers, this.gate, this.acceptor),
			this.buffers,
			this.assistant,
			this.authorizationTimeoutSeconds
		)
		
		let buffer = this.buffers.take()
		try {
			buffer.writeByte(ProtocolMarker.AUTHORIZATION)
			buffer.writeInt(this.version)
			buffer.writeInt(this.authorizationKey.length)
			buffer.writeArrayFully(this.authorizationKey)
			clientChannel.write(buffer)
		}
		finally {
			this.buffers.back(buffer)
		}
		
		return clientChannel
	}
	
	acceptFail(): void {
		this.acceptor.acceptFail(ConnectFailReason.REFUSED)
	}
}


