import {CpdAdapter} from '../CpdAdapter'
import {LocalStorage} from '../../app/LocalStorage'
import {CpdAccount} from '../CpdAccount'

export abstract class AbstractAdapter implements CpdAdapter {
	public readonly abstract purchaseAvailable: boolean
	
	protected readonly _storage: LocalStorage
	
	constructor(storage: LocalStorage) {
		this._storage = storage.branch('cpd')
	}
	
	public abstract authorize(): Promise<CpdAccount | null>
	
	public abstract loadShop(ids: string[],
		receiver: (currency: string, products: Array<{id: string; price: number}>) => void,
		purchaseConsumer: (productId: string, orderId: string, receipt: string, successConsumer: () => void) => void
	): void
	
	public abstract purchase(product: {id: string; name: string; price: number}, onSuccess: (orderId: string, receipt: string, successConsumer: () => void) => void, onFail: (reason: string) => void): void
	
	public abstract getAppFriends(): Promise<Array<string>>
	
	protected abstract getDeviceId(): Promise<string>
	
	protected abstract makeCsiAuthKeyPrefix(): string
}