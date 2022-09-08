import {InnerApi} from './InnerApi'
import {ConnectionHandler} from '../../core/client/ConnectionHandler'
import {BaseApiConnection} from '../BaseApiConnection'
import {Context} from '../Context'
import {ConnectionRecoveryHandler} from '../../core/client/ConnectionRecoveryHandler'

export abstract class AbstractApiConnection<IA extends InnerApi> extends BaseApiConnection<IA> implements ConnectionHandler {
	
	protected constructor(context: Context, api: IA) {
		super(context, api)
	}
	
	handleConnectionCloseTimeout(seconds: number) {
		this.api.handleConnectionCloseTimeout(seconds)
	}
	
	handleConnectionLost(): ConnectionRecoveryHandler {
		return this.api.handleConnectionLost()
	}
}