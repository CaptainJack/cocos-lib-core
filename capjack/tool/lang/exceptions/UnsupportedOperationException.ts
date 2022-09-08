import {Exception} from "./Exception";

export class UnsupportedOperationException extends Exception {
	constructor(message?: string, cause?: Error) {
		super(message, cause);
	}
}
