import {AbstractBrowserAdapter} from './AbstractBrowserAdapter'
import {CpdAccount} from '../CpdAccount'
import {Exception} from '../../capjack/tool/lang/exceptions/Exception'
import {extractError} from '../../capjack/tool/lang/_errors'
import {LocalStorage} from '../../app/LocalStorage'
import {EMPTY_FUNCTION} from '../../capjack/tool/lang/_utils'

export class OkBrowserAdapter extends AbstractBrowserAdapter {
	public readonly purchaseAvailable: boolean = true
	
	private readonly _userId: string
	
	private _onPurchaseSuccess: (orderId: string, receipt: string) => void = EMPTY_FUNCTION
	private _onPurchaseFail: (reason: string) => void = EMPTY_FUNCTION
	
	constructor(storage: LocalStorage, userId: string) {
		super(storage)
		this._userId = userId
		
		window['API_callback'] = (method: string, result: string, data: any) => {
			if (method == 'showPayment') {
				if (result == 'error') {
					this._onPurchaseFail(data)
				}
				else {
					this._onPurchaseSuccess(null, null)
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
	
	public purchase(product: {id: string; name: string; price: number}, onSuccess: (orderId: string, receipt: string) => void, onFail: (reason: string) => void): void {
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
	
	protected makeCsiAuthKeyPrefix(): string {
		return 'ok' + super.makeCsiAuthKeyPrefix()
	}
}