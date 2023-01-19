import {AbstractBrowserAdapter} from './AbstractBrowserAdapter'
import {CpdAccount} from '../CpdAccount'
import {Exception} from '../../capjack/tool/lang/exceptions/Exception'
import {extractError} from '../../capjack/tool/lang/_errors'
import {LocalStorage} from '../../app/LocalStorage'

export class YandexBrowserAdapter extends AbstractBrowserAdapter {
	public readonly purchaseAvailable: boolean = true
	
	private _userId: string
	private payments: YaPayments
	
	constructor(storage: LocalStorage, private ysdk: YaSdk) {
		super(storage)
	}
	
	public authorize(): Promise<CpdAccount | null> {
		
		return new Promise((resolve, reject) => {
			this.player(resolve, reject)
		})
	}
	
	public loadShop(ids: string[],
		receiver: (currency: string, products: Array<{id: string; price: number}>) => void,
		purchaseConsumer: (productId: string, orderId: string, receipt: string, successConsumer: () => void) => void
	): void {
		
		this.ysdk.getPayments({signed: true}).then(payments => {
			this.payments = payments
			
			receiver('YAN', [])
			
			payments.getPurchases().then(purchases => {
				if (purchases.length > 0) {
					// @ts-ignore
					purchaseConsumer(null, null, purchases.signature, () => {
						purchases.forEach(p => {
							payments.consumePurchase(p.purchaseToken)
						});
					})
				}
			})
		}).catch(e => {
			throw new Exception('Payments is not available', extractError(e))
		})
	}
	
	public purchase(product: {id: string; name: string; price: number}, onSuccess: (orderId: string, receipt: string, successConsumer: () => void) => void, onFail: (reason: string) => void): void {
		this.payments.purchase({id: product.id})
			.then(purchase => {
				onSuccess(null, purchase.signature, () => this.payments.consumePurchase(purchase.purchaseToken))
			})
			.catch(() => onFail('failure'))
	}
	
	public getAppFriends(): Promise<Array<string>> {
		return Promise.resolve([])
	}
	
	protected makeCsiAuthKeyPrefix(): string {
		return 'ya' + super.makeCsiAuthKeyPrefix()
	}
	
	private player(resolve, reject) {
		this.ysdk.getPlayer({signed: true})
			.then(player => {
				if (player.getMode() === 'lite') {
					this.auth(resolve, reject)
				}
				else {
					this._userId = player.getUniqueID()
					
					const element = document.getElementById("app-user-id")
					if (element) {
						element.innerText = `YA${this._userId}`
					}
					
					resolve(new CpdAccount(
						this.makeCsiAuthKeyPrefix() + this._userId,
						player.getName(),
						player.getPhoto('medium')
					))
					
				}
			})
			.catch(e => reject(new Exception('Failed to YANDEX getPlayer', extractError(e))))
	}
	
	private auth(resolve, reject) {
		this.ysdk.auth.openAuthDialog()
			.then(() => this.player(resolve, reject))
			.catch(() => this.auth(resolve, reject))
	}
}