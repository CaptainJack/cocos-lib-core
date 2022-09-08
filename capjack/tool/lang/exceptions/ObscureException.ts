import {Exception} from './Exception'

export class ObscureException extends Exception {
	constructor(readonly source: any) {
		super(source.toString())
	}
}