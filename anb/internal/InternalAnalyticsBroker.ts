import {AnalyticsBroker} from '../AnalyticsBroker'
import {AnalyticsBrokerConfig} from '../_init'

export interface InternalAnalyticsBroker extends AnalyticsBroker {
	init(config: AnalyticsBrokerConfig): Promise<void>
}