import {AbstractNativeAdapter} from 'db://assets/core/lib-core/cpd/internal/AbstractNativeAdapter'
import {CpdAccount} from 'db://assets/core/lib-core/cpd/CpdAccount'
import {_random} from 'db://assets/core/lib-core/tools/_random'
import {EMPTY_FUNCTION} from 'db://assets/core/lib-core/capjack/tool/lang/_utils'
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
		receiver(null, [])
	}
	
	public purchase(product: {
		id: string;
		name: string;
		price: number
	}, onSuccess: (orderId: string, receipt: string, successConsumer: () => void) => void, onFail: (reason: string) => void): void {
		if (app.debug) {
			onSuccess(`TEST-${Date.now()}-${_random.intOfRange(0, 2000000000)}`, 'TEST', EMPTY_FUNCTION)
		}
		else {
			onFail('NOT_AVAILABLE')
		}
	}
	
	protected getDeviceId(): Promise<string> {
		const deviceId = _native.callJava('ru.capjack.cpd.Cpd.getDeviceId()s')
		return Promise.resolve(deviceId)
	}
	
	protected makeCsiAuthKeyPrefix(): string {
		return 'guna'
	}
}