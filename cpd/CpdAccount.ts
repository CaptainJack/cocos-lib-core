import {_string} from '../capjack/tool/lang/_string'

export class CpdAccount {
	constructor(
		readonly csiAuthKey: string,
		readonly userName: string | null,
		readonly userAvatar: string | null
	) {
		this.userName = _string.isBlank(userName) ? null : userName.trim()
		this.userAvatar = _string.isBlank(userAvatar) ? null : userAvatar.trim()
	}
}