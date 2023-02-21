import {CpdAdapter} from '../CpdAdapter'
import {LocalStorage} from '../../app/LocalStorage'
import {CpdAccount} from '../CpdAccount'
import {screen} from 'cc'

export abstract class AbstractAdapter implements CpdAdapter {
	public authorized: boolean = true
	
	protected readonly _storage: LocalStorage
	
	constructor(storage: LocalStorage) {
		this._storage = storage.branch('cpd')
	}
	
	public abstract login(): Promise<CpdAccount>
	
	public authorize(): Promise<CpdAccount> {
		return Promise.reject()
	}
	
	public abstract loadShop(ids: string[],
		receiver: (currency: string, products: Array<{id: string; price: number}>) => void,
		purchaseConsumer: (productId: string, orderId: string, receipt: string, successConsumer: () => void) => void
	): void
	
	public abstract purchase(product: {id: string; name: string; price: number}, onSuccess: (orderId: string, receipt: string, successConsumer: () => void) => void, onFail: (reason: string) => void): void
	
	public abstract getAppFriends(): Promise<Array<string>>
	
	public ready(): void {}
	
	protected abstract getDeviceId(): Promise<string>
	
	protected abstract makeCsiAuthKeyPrefix(): string
	
	public isFullScreenAvailable(): boolean {
		return screen.supportsFullScreen
	}
	
	public isFullScreenCurrent(): boolean {
		return screen.fullScreen()
	}
	
	public enterFullScreen() {
		screen.requestFullScreen()
	}
	
	public exitFullScreen() {
		screen.exitFullScreen()
	}
}