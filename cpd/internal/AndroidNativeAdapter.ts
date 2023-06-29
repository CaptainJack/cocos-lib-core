import {AbstractNativeAdapter} from 'db://assets/core/lib-core/cpd/internal/AbstractNativeAdapter'
import {CpdAccount} from 'db://assets/core/lib-core/cpd/CpdAccount'
import {_native} from '../../tools/_native'

export class AndroidNativeAdapter extends AbstractNativeAdapter {
	public getAppFriends(): Promise<Array<string>> {
		return Promise.resolve([])
	}
	
	public login(): Promise<CpdAccount> {
		return this.getDeviceId().then(deviceId => {
			return new CpdAccount(this.makeCsiAuthKeyPrefix() + deviceId, deviceId)
		})
	}
	
	public loadShop(ids: string[], receiver: (currency: string, products: Array<{
		id: string;
		price: number
	}>) => void, purchaseConsumer: (productId: string, orderId: string, receipt: string, successConsumer: () => void) => void): void {
		
		window['cpd_givePurchase'] = (productId: string, orderId: string, receipt: string) => {
			purchaseConsumer(productId, orderId, receipt, () => {
				_native.callJava('ru.capjack.cpd.Cpd.confirmPurchase(s)', orderId)
			})
		}
		
		_native.callJava('ru.capjack.cpd.Cpd.actualizePurchases()')
		
		receiver(null, [])
	}
	
	public purchase(product: {
		id: string;
		name: string;
		price: number
	}, onSuccess: (orderId: string, receipt: string, successConsumer: () => void) => void, onFail: (reason: string) => void): void {
		
		window['cpd_successPurchase'] = (orderId: string, receipt: string) => {
			onSuccess(orderId, receipt, () => {
				_native.callJava('ru.capjack.cpd.Cpd.confirmPurchase(s)', orderId)
			})
		}
		
		window['cpd_failPurchase'] = (reason: string) => {
			onFail(reason)
		}
		
		_native.callJava('ru.capjack.cpd.Cpd.purchase(s)', product.id)
	}
	
	protected getDeviceId(): Promise<string> {
		const deviceId = _native.callJava('ru.capjack.cpd.Cpd.getDeviceId()s')
		return Promise.resolve(deviceId)
	}
	
	protected makeCsiAuthKeyPrefix(): string {
		return 'guna'
	}
}