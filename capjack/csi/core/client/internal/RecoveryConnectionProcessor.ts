import {InternalConnectionProcessor} from '../../internal/InternalConnectionProcessor'
import {ConnectionRecoveryHandler} from '../ConnectionRecoveryHandler'
import {TemporalAssistant} from '../../../../tool/utils/assistant/TemporalAssistant'
import {ObjectPool} from '../../../../tool/utils/pool/ObjectPool'
import {ByteBuffer} from '../../../../tool/io/ByteBuffer'
import {ChannelGate} from '../ChannelGate'
import {InternalConnection} from '../../internal/InternalConnection'
import {RecoveryChannelAcceptor} from './RecoveryChannelAcceptor'
import {UnsupportedOperationException} from '../../../../tool/lang/exceptions/UnsupportedOperationException'
import {InternalChannel} from '../../internal/InternalChannel'
import {InputByteBuffer} from '../../../../tool/io/InputByteBuffer'
import {NothingConnectionProcessor} from '../../internal/NothingConnectionProcessor'
import {ProtocolBrokenException} from '../../ProtocolBrokenException'

// noinspection JSUnusedLocalSymbols
export class RecoveryConnectionProcessor implements InternalConnectionProcessor {
	constructor(
		private messagingProcessor: InternalConnectionProcessor,
		private recoveryHandler: ConnectionRecoveryHandler,
		assistant: TemporalAssistant,
		buffers: ObjectPool<ByteBuffer>,
		gate: ChannelGate,
		connection: InternalConnection,
		activityTimeoutSeconds: number,
		lastIncomingMessageId: number
	) {
		assistant.schedule(10, () => {
			gate.openChannel(new RecoveryChannelAcceptor(assistant, buffers, connection, activityTimeoutSeconds, lastIncomingMessageId))
		})
	}
	
	processConnectionAccept(channel: InternalChannel, connection: InternalConnection): InternalConnectionProcessor {
		throw new UnsupportedOperationException()
	}
	
	processConnectionRecovery(channel: InternalChannel): InternalConnectionProcessor {
		let p = this.messagingProcessor
		let h = this.recoveryHandler
		
		this.free()
		
		p = p.processConnectionRecovery(channel)
		h.handleConnectionRecovered()
		
		return p
	}
	
	processConnectionClose() {
		let p = this.messagingProcessor
		this.free()
		p.processConnectionClose()
	}
	
	processChannelInput(channel: InternalChannel, buffer: InputByteBuffer): boolean {
		throw new ProtocolBrokenException('Not expected incoming data')
	}
	
	processChannelInterrupt(connection: InternalConnection): InternalConnectionProcessor {
		throw new UnsupportedOperationException()
	}
	
	private free() {
		this.messagingProcessor = new NothingConnectionProcessor()
		this.recoveryHandler = null
	}
}