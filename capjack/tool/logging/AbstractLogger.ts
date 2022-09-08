import {Logger} from "./Logger";
import {Level} from "./Level";

export abstract class AbstractLogger implements Logger {
	abstract get name(): string;
	
	get errorEnabled(): boolean {
		return this.isEnabled(Level.ERROR)
	}
	
	get warnEnabled(): boolean {
		return this.isEnabled(Level.WARN)
	}
	
	get infoEnabled(): boolean {
		return this.isEnabled(Level.INFO)
	}
	
	get debugEnabled(): boolean {
		return this.isEnabled(Level.DEBUG)
	}
	
	get traceEnabled(): boolean {
		return this.isEnabled(Level.TRACE)
	}
	
	error(message: string, error?: any): void {
		this.log(Level.ERROR, message, error)
	}
	
	warn(message: string, error?: any): void {
		this.log(Level.WARN, message, error)
	}
	
	info(message: string, error?: any): void {
		this.log(Level.INFO, message, error)
	}
	
	debug(message: string, error?: any): void {
		this.log(Level.DEBUG, message, error)
	}
	
	trace(message: string, error?: any): void {
		this.log(Level.TRACE, message, error)
	}
	
	abstract isEnabled(level: Level): boolean;
	
	abstract log(level: Level, message: string, error?: any): void;
}

