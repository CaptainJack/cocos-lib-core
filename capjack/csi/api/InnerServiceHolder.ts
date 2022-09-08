import {InnerServiceHolderItem} from './InnerServiceHolderItem'
import {InnerServiceDelegate} from './InnerServiceDelegate'

export class InnerServiceHolder {
	private readonly map = new Map<number, InnerServiceHolderItem<any>>()
	private nextId = 0
	
	get(id: number): InnerServiceDelegate<any> | null {
		const item = this.map.get(id)
		return item ? item.delegate : null
	}
	
	close(id: number): boolean {
		const item = this.map.get(id)
		if (item) {
			this.map.delete(id)
			item.delegate.close()
			item.instance.close()
			return true
		}
		return false
	}
	
	add(item: InnerServiceHolderItem<any>): number {
		while (true) {
			const id = this.nextId++
			if (!this.map.has(id)) {
				this.map.set(id, item)
				item.delegate.setup(id)
				return id
			}
		}
	}
	
	closeAll() {
		this.map.forEach((v, k) => this.close(k))
	}
}

