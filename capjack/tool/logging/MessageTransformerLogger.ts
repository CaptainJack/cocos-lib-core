import {AbstractLogger} from "./AbstractLogger";
import {Logger} from "./Logger";
import {Level} from "./Level";

export abstract class MessageTransformerLogger extends AbstractLogger {
	protected constructor(private readonly target: Logger) {
		super();
	}
	
	get name(): string {
		return this.target.name
	}
	
	isEnabled(level: Level): boolean {
		return this.target.isEnabled(level)
	}
	
	log(level: Level, message: string, error?: any): void {
		if (this.isEnabled(level)) {
			this.target.log(level, this.transformMessage(message), error)
		}
	}
	
	protected abstract transformMessage(message: string): string
}