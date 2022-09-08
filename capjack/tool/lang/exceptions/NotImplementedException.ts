import {Exception} from './Exception'

export class NotImplementedException extends Exception {
	constructor(message: string = 'An operation is not implemented', cause: Error | null = null) {
		super()
	}
}