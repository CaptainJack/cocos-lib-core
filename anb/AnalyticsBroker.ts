import {Long} from '../capjack/tool/lang/Long'

declare global {
	const anb: AnalyticsBroker
}

export interface AnalyticsBroker {
	
	tutorial(step: number)
	
	profile(profile: {
		name?: string,
		email?: string,
		phone?: string,
		photo?: string,
		gender?: AnalyticsBrokerGender,
		age?: number,
	})
	
	currentBalance(balance?: Record<string, number | Long>)
	
	levelUp(
		level: number,
		balance?: Record<string, number | Long>,
		spent?: Record<string, number | Long>,
		earned?: Record<string, number | Long>,
		bought?: Record<string, number | Long>
	)
	
	realPayment(orderId: string, productId: string, price: number, currency: string)
}

export enum AnalyticsBrokerGender {
	UNKNOWN,
	MALE,
	FEMALE
}