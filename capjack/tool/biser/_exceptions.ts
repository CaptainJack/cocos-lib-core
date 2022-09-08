import {Exception} from '../lang/exceptions/Exception'

export class BiserException extends Exception {
	constructor(message?: string, cause?: Error) {
		super(message, cause)
	}
}

export class BiserReadException extends BiserException {
	constructor(message?: string, cause?: Error) {
		super(message, cause)
	}
}

export class BiserReadNegativeSizeException extends BiserReadException {
	constructor(size: number) {
		super(`Negative size (${size})`)
	}
}

export class EncoderException extends BiserException {
	constructor(message?: string, cause?: Error) {
		super(message, cause)
	}
}

export class DecoderException extends BiserException {
	constructor(message?: string, cause?: Error) {
		super(message, cause)
	}
}

export class UnknownEntityEncoderException extends EncoderException {
	constructor(entity: any) {
		super(`Entity ${entity.constructor} is unknown for encode`)
	}
}

export class UnknownIdDecoderException extends EncoderException {
	constructor(id: number, type: any) {
		super(`Id ${id} is unknown for decode ${type}`)
	}
}