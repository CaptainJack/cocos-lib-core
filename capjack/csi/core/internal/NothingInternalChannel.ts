import {InternalChannel} from './InternalChannel'
import {UnsupportedOperationException} from '../../../tool/lang/exceptions/UnsupportedOperationException'
import {NothingChannel} from './NothingChannel'

// noinspection JSUnusedLocalSymbols
export class NothingInternalChannel extends NothingChannel implements InternalChannel {
	closeWithMarker(marker: number) {
		throw new UnsupportedOperationException()
	}
	
	writeArray(data: Int8Array): void {
		throw new UnsupportedOperationException()
	}
	
	writeByte(data: number): void {
		throw new UnsupportedOperationException()
	}
}