import {Exception} from "./Exception";

export class NoSuchElementException extends Exception {
	constructor(message?: string) {
		super(message)
	}
}
