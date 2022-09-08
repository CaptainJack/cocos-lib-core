import {Exception} from "./Exception";

export class IllegalArgumentException extends Exception {
	constructor(message?: string, cause?: Error) {
		super(message, cause);
	}
}