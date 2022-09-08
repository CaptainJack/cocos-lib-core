import {ChannelAcceptor} from '../ChannelAcceptor'
import {TemporalAssistant} from '../../../../tool/utils/assistant/TemporalAssistant'
import {ObjectPool} from '../../../../tool/utils/pool/ObjectPool'
import {ByteBuffer} from '../../../../tool/io/ByteBuffer'
import {InternalConnection} from '../../internal/InternalConnection'
import {ChannelHandler} from '../../ChannelHandler'
import {Channel} from '../../Channel'
import {ClientChannelImpl} from './ClientChannelImpl'
import {ProtocolMarker} from '../../internal/ProtocolMarker'
import {RecoveryChannelProcessor} from './RecoveryChannelProcessor'

export class RecoveryChannelAcceptor implements ChannelAcceptor {
	constructor(
		private readonly assistant: TemporalAssistant,
		private readonly buffers: ObjectPool<ByteBuffer>,
		private readonly connection: InternalConnection,
		private readonly activityTimeoutSeconds: number,
		private readonly lastIncomingMessageId: number
	) {}
	
	acceptChannel(channel: Channel): ChannelHandler {
		let clientChannel = new ClientChannelImpl(
			channel,
			new RecoveryChannelProcessor(this.connection),
			this.buffers,
			this.assistant,
			this.activityTimeoutSeconds
		)
		
		let buffer = this.buffers.take()
		try {
			buffer.writeByte(ProtocolMarker.RECOVERY)
			buffer.writeLong(this.connection.id)
			buffer.writeInt(this.lastIncomingMessageId)
			clientChannel.write(buffer)
		}
		finally {
			this.buffers.back(buffer)
		}
		
		return clientChannel
	}
	
	acceptFail(): void {
		this.connection.close()
	}
}