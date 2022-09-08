import {Logger} from './Logger'
import {Output} from './Output'
import {Level} from './Level'
import {ProxyOutput} from './ProxyOutput'
import {ConsoleOutput} from './ConsoleOutput'
import {AbstractLogger} from './AbstractLogger'
import {Record} from './Record'
import {PrefixMessageTransformerLogger} from './PrefixMessageTransformerLogger'
import {ConsoleOutputFormatter} from './ConsoleOutputFormatter'
import {extractError} from '../lang/_errors'

export interface Logging {
	getLogger(name: string): Logger
	
	getLoggerPrefixed(name: string, prefix: string): Logger
	
	setOutput(value: Output): void
	
	setLevel(value: Level): void
	
	setLevelFor(name: string, level: Level): void
}

class LoggingImpl implements Logging {
	
	private output = new ProxyOutput(new ConsoleOutput(new ConsoleOutputFormatter()))
	private rootLevel: Level = Level.INFO
	private levels = new Map<string, Level>()
	private loggers = new Map<string, LoggerImpl>()
	
	getLogger(name: string): Logger {
		let logger = this.loggers.get(name)
		if (!logger) {
			logger = new LoggerImpl(name, this.defineLevel(name), this.output)
			this.loggers.set(name, logger)
		}
		return logger
	}
	
	getLoggerPrefixed(name: string, prefix: string): Logger {
		return new PrefixMessageTransformerLogger(this.getLogger(name), prefix)
	}
	
	setOutput(value: Output) {
		this.output.target = value
	}
	
	setLevel(value: Level) {
		this.rootLevel = value

		this.loggers.forEach(logger => {
			logger.level = this.rootLevel
		})
	}
	
	setLevelFor(name: string, level: Level) {
		this.levels.set(name, level)
		const path = name + '.'
		
		this.loggers.forEach(logger => {
			if (logger.name == name || logger.name.startsWith(path)) {
				logger.level = level
			}
		})
	}
	
	private defineLevel(name: string): Level {
		let n = name
		
		while (true) {
			const level = this.levels.get(n)
			if (level) {
				return level
			}
			const i = n.lastIndexOf('.')
			if (i <= 0) {
				break
			}
			n = n.substring(0, i)
		}
		
		return this.rootLevel
	}
}

class LoggerImpl extends AbstractLogger {
	
	constructor(
		readonly name: string,
		public level: Level,
		private output: Output
	) {
		super()
	}
	
	isEnabled(level: Level): boolean {
		return this.level >= level
	}
	
	log(level: Level, message: string, error?: any): void {
		if (this.isEnabled(level)) {
			if (error !== undefined && error !== null) error = extractError(error)
			this.output.writeRecord(new Record(window.performance.now(), this.name, level, message, error))
		}
	}
}

export const Logging: Logging = new LoggingImpl()
