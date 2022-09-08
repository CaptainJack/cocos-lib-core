import {AbstractBrowserAdapter} from './AbstractBrowserAdapter'
import {CpdAccount} from '../CpdAccount'
import {Exception} from '../../capjack/tool/lang/exceptions/Exception'
import {extractError} from '../../capjack/tool/lang/_errors'
import {LocalStorage} from '../../app/LocalStorage'

export class OkBrowserAdapter extends AbstractBrowserAdapter {
	private _userId: string
	
	constructor(storage: LocalStorage, userId: string) {
		super(storage)
		this._userId = userId
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
	
	protected makeCsiAuthKeyPrefix(): string {
		return 'ok' + super.makeCsiAuthKeyPrefix()
	}
}