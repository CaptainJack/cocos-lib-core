import {Level} from "./Level";

export interface Logger {
	readonly name: string
	
	readonly errorEnabled: boolean
	readonly warnEnabled: boolean
	readonly infoEnabled: boolean
	readonly debugEnabled: boolean
	readonly traceEnabled: boolean
	
	isEnabled(level: Level): boolean
	
	log(level: Level, message: string, error?: any): void
	
	error(message: string, error?: any): void
	
	warn(message: string, error?: any): void
	
	info(message: string, error?: any): void
	
	debug(message: string, error?: any): void
	
	trace(message: string, error?: any): void
}