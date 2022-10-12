import {InternalAnalyticsBroker} from './InternalAnalyticsBroker'
import {AnalyticsBrokerConfig} from '../_init'
import {AnalyticsBrokerGender} from '../AnalyticsBroker'
import {Long} from '../../capjack/tool/lang/Long'

export abstract class BaseAnalyticsBroker implements InternalAnalyticsBroker {
	public abstract currentBalance(balance?: Record<string, number | Long>)
	
	public abstract init(config: AnalyticsBrokerConfig): Promise<void>
	
	public abstract levelUp(level: number, balance?: Record<string, number | Long>, spent?: Record<string, number | Long>, earned?: Record<string, number | Long>, bought?: Record<string, number | Long>)
	
	public abstract tutorial(step: number)
	
	public abstract profile(profile: {name?: string; email?: string; phone?: string; photo?: string; gender?: AnalyticsBrokerGender; age?: number})
	
	public realPayment(orderId: string, productId: string, price: number, currency: string) {
		price = this.normaliseRealPrice(currency, price)
		currency = this.normaliseRealCurrency(currency)
		this.doRealPayment(orderId, productId, price, currency)
	}
	
	protected abstract doRealPayment(orderId: string, productId: string, price: number, currency: string)
	
	private normaliseRealCurrency(currency: string): string {
		if (currency == 'OK' || currency == 'VK') {
			return 'RUB'
		}
		return currency
	}
	
	private normaliseRealPrice(currency: string, price: number) {
		if (currency == 'VK') {
			return price * 7
		}
		return price
	}
}