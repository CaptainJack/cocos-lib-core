export interface ObjectAllocator<T> {
	produceInstance(): T
	
	clearInstance(instance: T): void
	
	disposeInstance(instance: T): void
}