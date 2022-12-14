import {sys} from 'cc'
import {UnsupportedOperationException} from '../capjack/tool/lang/exceptions/UnsupportedOperationException'
import {BrowserAnalyticsBroker} from './internal/BrowserAnalyticsBroker'
import {DummyAnalyticsBroker} from './internal/DummyAnalyticsBroker'
import {InternalAnalyticsBroker} from './internal/InternalAnalyticsBroker'

export function initAnb(config: AnalyticsBrokerConfig): Promise<void> {
	if (window['anb']) {
		return Promise.resolve()
	}
	
	let broker: InternalAnalyticsBroker
	
	if (sys.isNative) {
		if (sys.os == sys.OS.IOS) {
			// broker = new Apple()
			throw new UnsupportedOperationException()
		}
		if (sys.os == sys.OS.ANDROID) {
			// broker = new Android()
			throw new UnsupportedOperationException()
		}
	}
	else {
		if (window['devtodev'] && window['devtodevAppId'] != '{DTD}') {
			broker = new BrowserAnalyticsBroker()
		}
		else {
			broker = new DummyAnalyticsBroker()
		}
	}
	
	window['anb'] = broker
	
	return broker.init(config)
}

export type AnalyticsBrokerConfig = {
	userId: string
	userLevel: number
}