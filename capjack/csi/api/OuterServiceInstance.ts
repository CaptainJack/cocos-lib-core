import {ServiceInstance} from './ServiceInstance'
import {OuterService} from './OuterService'

export class OuterServiceInstance<S extends OuterService> implements ServiceInstance<S> {
	constructor(readonly service: S) {}
	
	close(): void {
		this.service._close()
	}
	
}