import {sys} from 'cc'
import {AbstractAdapter} from './AbstractAdapter'
import {isNullable} from '../../capjack/tool/lang/_utils'

export abstract class AbstractBrowserAdapter extends AbstractAdapter {
	protected getDeviceId(): Promise<string> {
		let id: string = this._storage.get('deviceId')
		if (isNullable(id)) {
			id = this.generateDeviceId()
			this._storage.set('deviceId', id)
		}
		return Promise.resolve(id)
	}
	
	protected makeCsiAuthKeyPrefix(): string {
		// noinspection JSUnreachableSwitchBranches
		switch (sys.platform) {
			case sys.Platform.MOBILE_BROWSER:
				return 'bm'
			case sys.Platform.DESKTOP_BROWSER:
				return 'bd'
			default:
				return 'bn'
		}
	}
	
	private generateDeviceId(): string {
		const s = []
		for (let i = 0, l = 64; i < l; ++i) {
			s.push(((Math.random() * 16) | 0).toString(16))
		}
		return s.join('')
	}
}