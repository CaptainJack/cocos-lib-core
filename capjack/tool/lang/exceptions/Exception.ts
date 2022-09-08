export class Exception extends Error {
	constructor(readonly message: string | null = null, readonly cause: Error | null = null) {
		super(message)
		if (Object.setPrototypeOf) Object.setPrototypeOf(this, new.target.prototype)
		this.name = this.constructor.name
		// @ts-ignore
		if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor)
		
		if (this.cause !== null) {
			this.stack += '\nCaused by: ' + this.cause.stack
		}
	}
	
	toString(): string {
		return this.constructor.name + ((this.message === null || this.message === undefined) ? '' : ': ' + this.message)
	}
}