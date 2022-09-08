import {Channel} from '../Channel'
import {InputByteBuffer} from '../../../tool/io/InputByteBuffer'
import {UnsupportedOperationException} from '../../../tool/lang/exceptions/UnsupportedOperationException'

// noinspection JSUnusedLocalSymbols
export class NothingChannel implements Channel {
	constructor(
		readonly id: any
	) {}
	
	write(data: InputByteBuffer): void {
		throw new UnsupportedOperationException()
	}
	
	close(): void {
		throw new UnsupportedOperationException()
	}
}