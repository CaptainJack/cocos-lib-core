import {ConnectionRecoveryHandler} from '../../core/client/ConnectionRecoveryHandler'
import {BaseInnerApi} from '../BaseInnerApi'

export interface InnerApi extends BaseInnerApi {
	handleConnectionCloseTimeout(seconds: number)
	
	handleConnectionLost(): ConnectionRecoveryHandler
}