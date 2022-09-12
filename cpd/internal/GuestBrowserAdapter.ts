import {AbstractBrowserAdapter} from './AbstractBrowserAdapter'
import {CpdAccount} from '../CpdAccount'
import {UnsupportedOperationException} from '../../capjack/tool/lang/exceptions/UnsupportedOperationException'

export class GuestBrowserAdapter extends AbstractBrowserAdapter {
	
	public readonly purchaseAvailable: boolean = false
	
	public authorize(): Promise<CpdAccount | null> {
		return Promise.resolve(new CpdAccount(
			this.makeCsiAuthKeyPrefix() + this.getDeviceId(),
			null,
			null
		))
	}
	
	protected makeCsiAuthKeyPrefix(): string {
		return 'gu' + super.makeCsiAuthKeyPrefix()
	}
	
	public loadShop(ids: string[], receiver: (currency: string, products: Array<{id: string; price: number}>) => void): void {
		throw new UnsupportedOperationException()
	}
	
	public purchase(product: {id: string; name: string; price: number}, onSuccess: (orderId: string, receipt: string) => void, onFail: (reason: string) => void): void {
		throw new UnsupportedOperationException()
	}
}