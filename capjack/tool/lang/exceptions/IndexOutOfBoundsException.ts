import {Exception} from "./Exception";

export class IndexOutOfBoundsException extends Exception {
	constructor(message?: string) {
		super(message)
	}
}