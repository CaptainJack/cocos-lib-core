import {AbstractBrowserAdapter} from './AbstractBrowserAdapter'
import {CpdAccount} from '../CpdAccount'
import {_random} from '../../tools/_random'
import {EMPTY_FUNCTION} from '../../capjack/tool/lang/_utils'

export class GuestBrowserAdapter extends AbstractBrowserAdapter {
	
	public readonly purchaseAvailable: boolean = false
	
	public authorize(): Promise<CpdAccount | null> {
		return this.getDeviceId().then(deviceId => {
			return new CpdAccount(
				this.makeCsiAuthKeyPrefix() + deviceId,
				null,
				null
			)
		})
	}
	
	public loadShop(ids: string[], receiver: (currency: string, products: Array<{id: string; price: number}>) => void): void {
		receiver(null, [])
	}
	
	purchase(product: {id: string; name: string; price: number}, onSuccess: (orderId: string, receipt: string, successConsumer: () => void) => void, onFail: (reason: string) => void): void {
		if (app.debug) {
			onSuccess(`TEST-${Date.now()}-${_random.intOfRange(0, 2000000000)}`, 'TEST', EMPTY_FUNCTION)
		}
		else {
			onFail('NOT_AVAILABLE')
		}
	}
	
	public getAppFriends(): Promise<Array<string>> {
		return Promise.resolve([])
	}
	
	protected makeCsiAuthKeyPrefix(): string {
		return 'gu' + super.makeCsiAuthKeyPrefix()
	}
}