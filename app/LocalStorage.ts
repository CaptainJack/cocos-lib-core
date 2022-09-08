export interface LocalStorage {
	get<T>(key: string, other?: T): T | null
	
	set<T>(key: string, value: T): T
	
	remove(key: string)
	
	branch(name: string): LocalStorage
}

