import {Exception} from './Exception'

export class ErrorException extends Exception {
	constructor(readonly source: Error) {
		super(source.message)
	}
}