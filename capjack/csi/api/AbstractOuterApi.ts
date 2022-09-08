import {OuterApi} from './OuterApi'
import {Connection} from '../core/Connection'

export abstract class AbstractOuterApi implements OuterApi {
	
	protected constructor(protected readonly connection: Connection) {}
	
	closeConnection() {
		this.connection.close()
	}
}