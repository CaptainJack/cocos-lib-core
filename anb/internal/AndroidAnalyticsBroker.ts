import {BaseAnalyticsBroker} from './BaseAnalyticsBroker'
import {AnalyticsBrokerConfig} from '../_init'
import {Long} from '../../capjack/tool/lang/Long'
import {AnalyticsBrokerGender} from '../AnalyticsBroker'
import {_native} from '../../tools/_native'
import {isNullable} from '../../capjack/tool/lang/_utils'

export class AndroidAnalyticsBroker extends BaseAnalyticsBroker {
	public init(config: AnalyticsBrokerConfig): Promise<void> {
		_native.callJava('ru.capjack.anb.AnalyticsBroker.setupUser(s,i)', config.userId, config.userLevel)
		return Promise.resolve()
	}
	
	public currentBalance(balance?: Record<string, number | Long>) {
		_native.callJava('ru.capjack.anb.AnalyticsBroker.currentBalance(s)', balance)
	}
	
	public levelUp(level: number, balance?: Record<string, number | Long>) {
		_native.callJava('ru.capjack.anb.AnalyticsBroker.levelUp(i,s)', level, balance)
	}
	
	public profile(profile: {name?: string; email?: string; phone?: string; photo?: string; gender?: AnalyticsBrokerGender; age?: number}) {
		_native.callJava('ru.capjack.anb.AnalyticsBroker.profile(s,s,s,s,i,i)',
			profile.name,
			profile.email,
			profile.phone,
			profile.photo,
			isNullable(profile.gender) ? -1 : profile.gender,
			isNullable(profile.age) ? -1 : profile.age
		)
	}
	
	public tutorial(step: number) {
		_native.callJava('ru.capjack.anb.AnalyticsBroker.tutorial(i)', step)
	}
	
	protected doRealPayment(orderId: string, productId: string, price: number, currency: string) {
		_native.callJava('ru.capjack.anb.AnalyticsBroker.realPayment(s,s,s,s)', orderId, productId, price.toString(), currency)
	}
}