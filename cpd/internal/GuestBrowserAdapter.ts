import {AbstractBrowserAdapter} from './AbstractBrowserAdapter'
import {CpdAccount} from '../CpdAccount'
import {_random} from '../../tools/_random'

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
	
	public purchase(product: {id: string; name: string; price: number}, onSuccess: (orderId: string, receipt: string) => void, onFail: (reason: string) => void): void {
		if (app.debug) {
			onSuccess(`TEST-${Date.now()}-${_random.intOfRange(0, 2000000000)}`, 'TEST')
		}
		else {
			onFail('NOT_AVAILABLE')
		}
	}
	
	protected makeCsiAuthKeyPrefix(): string {
		return 'gu' + super.makeCsiAuthKeyPrefix()
	}
}