import {Exception} from "./Exception";

export class IllegalStateException extends Exception {
	constructor(message?: string, cause?: Error) {
		super(message, cause);
	}
}
