import {InternalConnectionProcessor} from './InternalConnectionProcessor'
import {Channel} from '../Channel'
import {InputByteBuffer} from '../../../tool/io/InputByteBuffer'
import {InternalConnection} from './InternalConnection'
import {UnsupportedOperationException} from '../../../tool/lang/exceptions/UnsupportedOperationException'

// noinspection JSUnusedLocalSymbols
export class NothingConnectionProcessor implements InternalConnectionProcessor {
	processChannelInput(channel: Channel, buffer: InputByteBuffer): boolean {
		throw new UnsupportedOperationException()
	}
	
	processChannelInterrupt(connection: InternalConnection): InternalConnectionProcessor {
		throw new UnsupportedOperationException()
	}
	
	processConnectionAccept(channel: Channel, connection: InternalConnection): InternalConnectionProcessor {
		throw new UnsupportedOperationException()
	}
	
	processConnectionClose() {
		throw new UnsupportedOperationException()
	}
	
	processConnectionRecovery(channel: Channel): InternalConnectionProcessor {
		throw new UnsupportedOperationException()
	}
}