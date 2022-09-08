import {ConnectionHandler} from '../ConnectionHandler'
import {UnsupportedOperationException} from '../../../../tool/lang/exceptions/UnsupportedOperationException'
import {InputByteBuffer} from '../../../../tool/io/InputByteBuffer'
import {ConnectionRecoveryHandler} from '../ConnectionRecoveryHandler'

// noinspection JSUnusedLocalSymbols
export class NothingConnectionHandler implements ConnectionHandler {
	handleConnectionClose() {
		throw new UnsupportedOperationException();
	}
	
	handleConnectionCloseTimeout(seconds: number) {
		throw new UnsupportedOperationException();
	}
	
	handleConnectionLost(): ConnectionRecoveryHandler {
		throw new UnsupportedOperationException();
	}
	
	handleConnectionMessage(message: InputByteBuffer) {
		throw new UnsupportedOperationException();
	}
}