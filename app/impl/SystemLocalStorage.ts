import {LocalStorage} from '../LocalStorage'
import {sys} from 'cc'
import {_string} from '../../capjack/tool/lang/_string'
import {isNullable} from '../../capjack/tool/lang/_utils'
import {Logging} from '../../capjack/tool/logging/Logging'

export class SystemLocalStorage implements LocalStorage {
	
	constructor(private readonly prefix: string) {
		this.prefix = _string.endWith(this.prefix, '/')
	}
	
	get<T>(key: string, other?: T): T | null {
		const value = sys.localStorage.getItem(this.prefix + key)
		
		if (isNullable(value)) {
			return isNullable(other) ? null : other
		}
		try {
			return JSON.parse(value)
		}
		catch (e) {
			Logging.getLogger('SystemLocalStorage').warn(`Broken value in storage ${key} = ${value}`, e)
			return isNullable(other) ? null : other
		}
	}
	
	set<T>(key: string, value: T): T {
		sys.localStorage.setItem(this.prefix + key, JSON.stringify(value))
		return value
	}
	
	remove(key: string) {
		sys.localStorage.removeItem(this.prefix + key)
	}
	
	branch(name: string): LocalStorage {
		return new SystemLocalStorage(this.prefix + name)
	}
}