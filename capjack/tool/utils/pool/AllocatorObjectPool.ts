import {ObjectPool} from './ObjectPool'
import {ObjectAllocator} from './ObjectAllocator'

export abstract class AllocatorObjectPool<T> implements ObjectPool<T> {
	
	protected constructor(
		private readonly allocator: ObjectAllocator<T>
	) {}
	
	abstract take(): T
	
	abstract back(instance: T)
	
	abstract clear(): void
	
	protected produceInstance(): T {
		return this.allocator.produceInstance()
	}
	
	protected clearInstance(instance: T) {
		this.allocator.clearInstance(instance)
	}
	
	protected disposeInstance(instance: T) {
		this.allocator.disposeInstance(instance)
	}
}

