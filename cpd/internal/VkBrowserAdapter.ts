import {AbstractBrowserAdapter} from './AbstractBrowserAdapter'
import {CpdAccount} from '../CpdAccount'
import {Exception} from '../../capjack/tool/lang/exceptions/Exception'
import {extractError} from '../../capjack/tool/lang/_errors'
import {LocalStorage} from '../../app/LocalStorage'
import {_random} from '../../tools/_random'
import {EMPTY_FUNCTION, isNullable} from '../../capjack/tool/lang/_utils'

export class VkBrowserAdapter extends AbstractBrowserAdapter {
	public readonly purchaseAvailable: boolean = true
	
	private readonly _appId: number
	private readonly _userId: string
	
	constructor(storage: LocalStorage, appId: string, userId: string) {
		super(storage)
		this._appId = parseInt(appId)
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
		return new Promise((resolve, reject) => {
			vkBridge.send('VKWebAppGetAuthToken', {app_id: this._appId, scope: 'friends'}).then(d => {
				if (d.access_token) {
					vkBridge.send('VKWebAppCallAPIMethod', {method: 'friends.getAppUsers', params: {v: '5.131', access_token: d.access_token}}).then(d => {
						if (isNullable(d.response)) {
							reject(new Exception('Failed call friends.getAppUsers', extractError(JSON.stringify(d))))
						}
						else {
							resolve(d.response.map(v => v.toString()))
						}
					})
				}
				else {
					reject(new Exception('Failed call VKWebAppGetAuthToken', extractError(JSON.stringify(d))))
				}
			})
		})
	}
	
	
	protected makeCsiAuthKeyPrefix(): string {
		return 'vk' + super.makeCsiAuthKeyPrefix()
	}
}