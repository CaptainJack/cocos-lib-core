import {AbstractBrowserAdapter} from './AbstractBrowserAdapter'
import {CpdAccount} from '../CpdAccount'

export class GuestBrowserAdapter extends AbstractBrowserAdapter {
	
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
}