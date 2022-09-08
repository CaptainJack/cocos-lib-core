import {ConnectionAcceptor} from '../ConnectionAcceptor'
import {ConnectFailReason} from '../ConnectFailReason'
import {ConnectionHandler} from '../ConnectionHandler'
import {Connection} from '../../Connection'
import {UnsupportedOperationException} from '../../../../tool/lang/exceptions/UnsupportedOperationException'

// noinspection JSUnusedLocalSymbols
export class NothingConnectionAcceptor implements ConnectionAcceptor {
	acceptConnection(connection: Connection): ConnectionHandler {
		throw new UnsupportedOperationException()
	}
	
	acceptFail(reason: ConnectFailReason): void {
		throw new UnsupportedOperationException()
	}
}