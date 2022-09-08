import {ObjectAllocator} from './ObjectAllocator'
import {AllocatorObjectPool} from './AllocatorObjectPool'

export class ArrayAllocatorObjectPool<T> extends AllocatorObjectPool<T> {
	
	private readonly instances: T[]
	private size: number = 0
	
	constructor(
		private readonly capacity: number,
		allocator: ObjectAllocator<T>
	) {
		super(allocator)
		this.instances = new Array(capacity)
	}
	
	take(): T {
		if (this.size == 0) {
			return this.produceInstance()
		}
		
		let i = --this.size
		let instance = this.instances[i]
		this.instances[i] = null
		return instance
	}
	
	back(instance: T) {
		if (this.size == this.capacity) {
			this.disposeInstance(instance)
		}
		else {
			this.clearInstance(instance)
			this.instances[this.size++] = instance
		}
	}
	
	clear() {
		for (let i = 0; i < this.size; i++) {
			let instance = this.instances[i]
			this.instances[i] = null
			this.disposeInstance(instance)
		}
		this.size = 0
	}
}