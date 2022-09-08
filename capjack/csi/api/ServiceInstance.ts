import {Closeable} from '../../tool/utils/Closeable'

export interface ServiceInstance<S> extends Closeable {
	readonly service: S
}

export class SimpleServiceInstance<S> implements ServiceInstance<S> {
	constructor(readonly service: S, private readonly closer: () => void) {}
	
	close(): void {
		this.closer()
	}
}