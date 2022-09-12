import {AbstractBrowserAdapter} from './AbstractBrowserAdapter'
import {CpdAccount} from '../CpdAccount'
import {UnsupportedOperationException} from '../../capjack/tool/lang/exceptions/UnsupportedOperationException'

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
		throw new UnsupportedOperationException()
	}
	
	public purchase(product: {id: string; name: string; price: number}, onSuccess: (orderId: string, receipt: string) => void, onFail: (reason: string) => void): void {
		throw new UnsupportedOperationException()
	}
	
	protected makeCsiAuthKeyPrefix(): string {
		return 'gu' + super.makeCsiAuthKeyPrefix()
	}
}