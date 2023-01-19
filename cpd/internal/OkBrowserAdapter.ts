import {AbstractBrowserAdapter} from './AbstractBrowserAdapter'
import {CpdAccount} from '../CpdAccount'
import {Exception} from '../../capjack/tool/lang/exceptions/Exception'
import {extractError} from '../../capjack/tool/lang/_errors'
import {LocalStorage} from '../../app/LocalStorage'
import {EMPTY_FUNCTION} from '../../capjack/tool/lang/_utils'
import {_random} from '../../tools/_random'
import {Logging} from '../../capjack/tool/logging/Logging'

export class OkBrowserAdapter extends AbstractBrowserAdapter {
	public readonly purchaseAvailable: boolean = true
	
	private readonly _userId: string
	
	private _onPurchaseSuccess: (orderId: string, receipt: string, successConsumer: () => void) => void = EMPTY_FUNCTION
	private _onPurchaseFail: (reason: string) => void = EMPTY_FUNCTION
	
	constructor(storage: LocalStorage, userId: string) {
		super(storage)
		this._userId = userId
		
		window['API_callback'] = (method: string, result: string, data: any) => {
			Logging.getLogger('cpd').debug(`OK API_callback (method: ${method}, result: ${result}, data: ${JSON.stringify(data)}`)
			
			if (method == 'showPayment') {
				if (result == 'ok') {
					this._onPurchaseSuccess(`OK-${this._userId}-${Date.now()}-${_random.intOfRange(0, 2000000000)}`, null, EMPTY_FUNCTION)
				}
				else {
					this._onPurchaseFail(data)
				}
				
				this._onPurchaseSuccess = EMPTY_FUNCTION
				this._onPurchaseFail = EMPTY_FUNCTION
			}
		}
	}
	
	public authorize(): Promise<CpdAccount | null> {
		return new Promise((resolve, reject) => {
			FAPI.Client.call({'method': 'users.getCurrentUser', 'fields': 'name,pic128x128'}, (status, data, error) => {
				if (error) {
					reject(new Exception('Failed to load OK user details', extractError(error)))
				}
				else {
					resolve(new CpdAccount(
						this.makeCsiAuthKeyPrefix() + this._userId,
						data['name'],
						data['pic128x128']
					))
				}
			})
		})
	}
	
	public loadShop(ids: string[], receiver: (currency: string, products: Array<{id: string; price: number}>) => void): void {
		receiver('OK', [])
	}
	
	public purchase(product: {id: string; name: string; price: number}, onSuccess: (orderId: string, receipt: string, successConsumer: () => void) => void, onFail: (reason: string) => void): void{
		this._onPurchaseSuccess = onSuccess
		this._onPurchaseFail = onFail
		FAPI.UI.showPayment(
			product.name,
			product.name,
			product.id,
			product.price,
			null,
			null,
			null,
			'true'
		)
	}
	
	public getAppFriends(): Promise<Array<string>> {
		return new Promise((resolve, reject) => {
			FAPI.Client.call({'method': 'friends.getAppUsers'}, (status, data, error) => {
				if (error) {
					reject(new Exception('Failed call friends.getAppUsers', extractError(error)))
				}
				else {
					resolve(data['uids'])
				}
			})
		})
	}
	
	protected makeCsiAuthKeyPrefix(): string {
		return 'ok' + super.makeCsiAuthKeyPrefix()
	}
}