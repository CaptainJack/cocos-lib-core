import {AbstractBrowserAdapter} from './AbstractBrowserAdapter'
import {CpdAccount} from '../CpdAccount'
import {Exception} from '../../capjack/tool/lang/exceptions/Exception'
import {extractError} from '../../capjack/tool/lang/_errors'
import {LocalStorage} from '../../app/LocalStorage'
import {_random} from '../../tools/_random'
import {EMPTY_FUNCTION} from '../../capjack/tool/lang/_utils'

export class VkBrowserAdapter extends AbstractBrowserAdapter {
	public readonly purchaseAvailable: boolean = true
	
	private readonly _userId: string
	
	constructor(storage: LocalStorage, userId: string) {
		super(storage)
		this._userId = userId
	}
	
	public authorize(): Promise<CpdAccount | null> {
		return new Promise((resolve, reject) =>
			vkBridge.send('VKWebAppGetUserInfo')
				.then(d => resolve(new CpdAccount(
					this.makeCsiAuthKeyPrefix() + this._userId,
					d['first_name'] + ' ' + d['last_name'],
					d['photo_200']
				)))
				.catch(e => reject(new Exception('Failed to load VK user details', extractError(e))))
		)
	}
	
	public loadShop(ids: string[], receiver: (currency: string, products: Array<{id: string; price: number}>) => void): void {
		receiver('VK', [])
	}
	
	public purchase(product: {id: string; name: string; price: number}, onSuccess: (orderId: string, receipt: string, successConsumer: () => void) => void, onFail: (reason: string) => void): void{
		vkBridge.send('VKWebAppShowOrderBox', {type: 'item', item: product.id})
		.then(d => {
			if (d.success) {
				onSuccess(`VK-${this._userId}-${Date.now()}-${_random.intOfRange(0, 2000000000)}`, null, EMPTY_FUNCTION)
			}
			else {
				onFail('failure')
			}
		})
		.catch(e => {
			onFail(e.error_data.error_reason)
		})
	}
	
	public getAppFriends(): Promise<Array<string>> {
		return Promise.resolve([])
	}
	
	
	protected makeCsiAuthKeyPrefix(): string {
		return 'vk' + super.makeCsiAuthKeyPrefix()
	}
}