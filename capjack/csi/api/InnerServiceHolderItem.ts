import {ServiceInstance} from './ServiceInstance'
import {InnerServiceDelegate} from './InnerServiceDelegate'

export class InnerServiceHolderItem<S> {
	constructor(
		readonly instance: ServiceInstance<S>,
		readonly delegate: InnerServiceDelegate<S>
	) {}
}