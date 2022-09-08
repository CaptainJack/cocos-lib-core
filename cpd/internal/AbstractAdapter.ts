import {CpdAdapter} from '../CpdAdapter'
import {LocalStorage} from '../../app/LocalStorage'
import {CpdAccount} from '../CpdAccount'

export abstract class AbstractAdapter implements CpdAdapter {
	protected readonly _storage: LocalStorage
	
	constructor(storage: LocalStorage) {
		this._storage = storage.branch('cpd')
	}
	
	public abstract authorize(): Promise<CpdAccount | null>
	
	protected abstract getDeviceId(): Promise<string>
	
	protected abstract makeCsiAuthKeyPrefix(): string
}