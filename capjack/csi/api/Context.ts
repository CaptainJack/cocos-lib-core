import {Logger} from '../../tool/logging/Logger'
import {ApiMessagePool} from './ApiMessagePool'
import {Connection} from '../core/Connection'
import {InnerServiceHolder} from './InnerServiceHolder'
import {OuterSubscriptionHolder} from './OuterSubscriptionHolder'
import {InnerSubscriptionHolder} from './InnerSubscriptionHolder'
import {CallbacksRegister} from './CallbacksRegister'

export class Context {
	readonly innerInstanceServices: InnerServiceHolder
	readonly innerSubscriptions: InnerSubscriptionHolder
	readonly outerSubscriptions: OuterSubscriptionHolder
	
	constructor(
		readonly logger: Logger,
		readonly messagePool: ApiMessagePool,
		readonly connection: Connection,
		readonly callbacks: CallbacksRegister
	) {
		this.innerInstanceServices = new InnerServiceHolder()
		this.innerSubscriptions = new InnerSubscriptionHolder()
		this.outerSubscriptions = new OuterSubscriptionHolder(logger)
	}
}
