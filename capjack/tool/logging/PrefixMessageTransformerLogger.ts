import {Logger} from "./Logger";
import {MessageTransformerLogger} from "./MessageTransformerLogger";

export class PrefixMessageTransformerLogger extends MessageTransformerLogger {
	
	constructor(target: Logger, private readonly prefix: string) {
		super(target);
	}
	
	protected transformMessage(message: string): string {
		return this.prefix + message;
	}
}