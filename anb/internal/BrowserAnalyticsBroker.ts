import {AnalyticsBrokerConfig} from '../_init'
import {BaseAnalyticsBroker} from './BaseAnalyticsBroker'
import {AnalyticsBrokerGender} from '../AnalyticsBroker'
import {isNullable} from '../../capjack/tool/lang/_utils'
import {Long} from '../../capjack/tool/lang/Long'

export class BrowserAnalyticsBroker extends BaseAnalyticsBroker {
	
	public init(config: AnalyticsBrokerConfig): Promise<void> {
		if (devtodev.getUserId() !== config.userId) devtodev.setUserId(config.userId)
		if (devtodev.getCurrentLevel() !== config.userLevel) devtodev.setCurrentLevel(config.userLevel)
		return Promise.resolve()
	}
	
	public tutorial(step: number) {
		devtodev.tutorial(step)
	}
	
	public levelUp(level: number, balance?: Record<string, number | Long>) {
		devtodev.levelUp(level, this.normalizeBalance(balance))
	}
	
	public profile(profile: {name?: string; email?: string; phone?: string; photo?: string; gender?: AnalyticsBrokerGender; age?: number}) {
		if (!isNullable(profile.name)) devtodev.user.setName(profile.name)
		if (!isNullable(profile.email)) devtodev.user.setEmail(profile.email)
		if (!isNullable(profile.phone)) devtodev.user.setPhone(profile.phone)
		if (!isNullable(profile.photo)) devtodev.user.setPhoto(profile.photo)
		if (!isNullable(profile.gender)) devtodev.user.setGender(profile.gender)
		if (!isNullable(profile.age)) devtodev.user.setAge(profile.age)
	}
	
	public currentBalance(balance?: Record<string, number | Long>) {
		devtodev.currentBalance(this.normalizeBalance(balance))
	}
	
	protected doRealPayment(orderId: string, productId: string, price: number, currency: string) {
		devtodev.realCurrencyPayment(orderId, price, productId, currency)
	}
	
	private normalizeBalance(balance: Record<string, number | Long>): Record<string, number> {
		if (isNullable(balance)) return undefined
		
		const r = {}
		for (const key of Object.keys(balance)) {
			const v = balance[key]
			r[key] = v instanceof Long ? v.toNumber() : v
		}
		return r
	}
}
