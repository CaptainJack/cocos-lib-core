import {Cancelable} from '../../tool/utils/Cancelable'
import {OuterSubscription} from './OuterSubscription'
import {Logger} from '../../tool/logging/Logger'

export class OuterSubscriptionHolder {
	private readonly map = new Map<number, OuterSubscription>()
	private nextId = 0
	
	constructor(readonly logger: Logger) {}
	
	add(subscription: OuterSubscription, cancelable: Cancelable): number {
		while (true) {
			const id = this.nextId++
			if (!this.map.has(id)) {
				this.map.set(id, subscription)
				subscription.setup(id, cancelable)
				return id
			}
		}
	}
	
	cancel(id: number): boolean {
		const subscription = this.map.get(id)
		if (subscription) {
			this.map.delete(id)
			try {
				subscription.cancel()
			}
			catch (e) {
				this.logger.error('Uncaught exception', e)
			}
			return true
		}
		return false
	}
	
	cancelAll() {
		this.map.forEach((v, k) => this.cancel(k))
	}
}