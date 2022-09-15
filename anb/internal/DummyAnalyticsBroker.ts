import {InternalAnalyticsBroker} from './InternalAnalyticsBroker'

export class DummyAnalyticsBroker implements InternalAnalyticsBroker {
	public init(): Promise<void> {
		return Promise.resolve()
	}
	
	public levelUp() {}
	
	public payment() {}
	
	public currentBalance() {}
	
	public profile() {}
	
	public realPayment() {}
	
	public tutorial() {}
}