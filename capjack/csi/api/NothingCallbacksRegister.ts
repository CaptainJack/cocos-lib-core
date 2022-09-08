import {BiserReader} from '../../tool/biser/BiserReader'
import {UnsupportedOperationException} from '../../tool/lang/exceptions/UnsupportedOperationException'
import {CallbacksRegister} from './CallbacksRegister'

// noinspection JSUnusedLocalSymbols
export class NothingCallbacksRegister implements CallbacksRegister {
	put(callback: (r: BiserReader, c: number) => void): number {
		throw new UnsupportedOperationException()
	}
	
	take(id: number): ((r: BiserReader, c: number) => void) | null {
		throw new UnsupportedOperationException()
	}
}

