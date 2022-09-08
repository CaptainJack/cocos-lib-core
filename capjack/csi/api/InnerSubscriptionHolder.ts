import {InnerSubscription} from './InnerSubscription'
import {asNullable} from '../../tool/lang/_utils'

export class InnerSubscriptionHolder {
	private map = new Map<number, InnerSubscription>()
	
	add(subscription: InnerSubscription) {
		this.map.set(subscription.id, subscription)
	}
	
	get(id: number): InnerSubscription | null {
		return asNullable(this.map.get(id))
	}
	
	remove(id: number) {
		this.map.delete(id)
	}
	
	cancelAll() {
		this.map.forEach(v => {
			v.cancel()
		})
	}
}