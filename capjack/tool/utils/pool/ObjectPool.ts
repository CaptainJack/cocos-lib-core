export interface ObjectPool<T> {
	take(): T
	
	back(instance: T)
	
	clear(): void
}

export function useObjectPool<T, R>(pool: ObjectPool<T>, code: (instance: T) => R): R {
	const instance = pool.take()
	try {
		return code(instance)
	}
	finally {
		pool.back(instance)
	}
}