import {InternalConnectionProcessor} from '../../internal/InternalConnectionProcessor'
import {TemporalAssistant} from '../../../../tool/utils/assistant/TemporalAssistant'
import {ObjectPool} from '../../../../tool/utils/pool/ObjectPool'
import {ByteBuffer} from '../../../../tool/io/ByteBuffer'
import {ConnectionAcceptor} from '../ConnectionAcceptor'
import {ChannelGate} from '../ChannelGate'
import {InputByteBuffer} from '../../../../tool/io/InputByteBuffer'
import {InternalConnection} from '../../internal/InternalConnection'
import {ProtocolBrokenException} from '../../ProtocolBrokenException'
import {UnsupportedOperationException} from '../../../../tool/lang/exceptions/UnsupportedOperationException'
import {ClientMessagingConnectionProcessor} from './ClientMessagingConnectionProcessor'
import {InternalChannel} from '../../internal/InternalChannel'

// noinspection JSUnusedLocalSymbols
export class AuthorizationConnectionProcessor implements InternalConnectionProcessor {
	constructor(
		private readonly assistant: TemporalAssistant,
		private readonly buffers: ObjectPool<ByteBuffer>,
		private readonly activityTimeoutSeconds: number,
		private readonly acceptor: ConnectionAcceptor,
		private readonly gate: ChannelGate
	) {}
	
	processConnectionAccept(channel: InternalChannel, connection: InternalConnection): InternalConnectionProcessor {
		let handler = this.acceptor.acceptConnection(connection)
		return new ClientMessagingConnectionProcessor(handler, connection.messages, connection.logger, this.assistant, this.buffers, this.activityTimeoutSeconds, this.gate, channel)
	}
	
	processConnectionRecovery(channel: InternalChannel): InternalConnectionProcessor {
		throw new UnsupportedOperationException()
	}
	
	processChannelInput(channel: InternalChannel, buffer: InputByteBuffer): boolean {
		throw new ProtocolBrokenException('Not expected incoming data')
	}
	
	processChannelInterrupt(connection: InternalConnection): InternalConnectionProcessor {
		connection.close()
		return this
	}
	
	processConnectionClose() {}
}

