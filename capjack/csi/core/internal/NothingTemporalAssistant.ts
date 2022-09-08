import {TemporalAssistant} from '../../../tool/utils/assistant/TemporalAssistant'
import {Cancelable} from '../../../tool/utils/Cancelable'
import {UnsupportedOperationException} from '../../../tool/lang/exceptions/UnsupportedOperationException'

// noinspection JSUnusedLocalSymbols
export class NothingTemporalAssistant implements TemporalAssistant {
	charge(code: () => void): Cancelable {
		throw new UnsupportedOperationException()
	}
	
	chargeOn(target: any, code: () => void): Cancelable {
		throw new UnsupportedOperationException()
	}
	
	execute(code: () => void): void {
		throw new UnsupportedOperationException()
	}
	
	executeOn(target: any, code: () => void): void {
		throw new UnsupportedOperationException()
	}
	
	repeat(delayMillis: number, code: () => void): Cancelable {
		throw new UnsupportedOperationException()
	}
	
	schedule(delayMillis: number, code: () => void): Cancelable {
		throw new UnsupportedOperationException()
	}
	
	wait(condition: () => boolean, action: () => void): Cancelable {
		throw new UnsupportedOperationException()
	}
}