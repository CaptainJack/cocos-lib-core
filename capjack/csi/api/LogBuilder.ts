// noinspection JSUnusedGlobalSymbols
export class LogBuilder {
	
	private string = ''
	
	static apply(code: (l: LogBuilder) => void): string {
		const lb = new LogBuilder()
		code(lb)
		return lb.toString()
	}
	
	toString(): string {
		return this.string
	}
	
	log(value: any) {
		this.string += value
	}
	
	logArray(value: any[]) {
		this.logArrayWith(value, (l, v) => l.log(v))
	}
	
	logArg(arg: string, value: any) {
		this.addArg(arg)
		this.log(value)
	}
	
	logArrayArg(arg: string, value: any[]) {
		this.addArg(arg)
		this.logArray(value)
	}
	
	logSep(value: any) {
		this.log(value)
		this.addSep()
	}
	
	logArraySep(value: any[]) {
		this.logArray(value)
		this.addSep()
	}
	
	logSepArg(arg: string, value: any) {
		this.addArg(arg)
		this.logSep(value)
	}
	
	logArraySepArg(arg: string, value: any[]) {
		this.addArg(arg)
		this.logArraySep(value)
	}
	
	logWith<T>(value: T, logger: (l: LogBuilder, v: T) => void) {
		logger(this, value)
	}
	
	logSepWith<T>(value: T, logger: (l: LogBuilder, v: T) => void) {
		this.logWith(value, logger)
		this.addSep()
	}
	
	logWithArg<T>(arg: string, value: T, logger: (l: LogBuilder, v: T) => void) {
		this.addArg(arg)
		this.logWith(value, logger)
	}
	
	logSepWithArg<T>(arg: string, value: T, logger: (l: LogBuilder, v: T) => void) {
		this.logWithArg(arg, value, logger)
		this.addSep()
	}
	
	logArrayWith<T>(value: T[], logger: (l: LogBuilder, v: T) => void) {
		this.string += '['
		let s = false
		for (const v of value) {
			if (s) {
				this.addSep()
			}
			else {
				s = true
			}
			this.logWith(v, logger)
		}
		this.string += ']'
	}
	
	logArraySepWith<T>(value: T[], logger: (l: LogBuilder, v: T) => void) {
		this.logArrayWith(value, logger)
		this.addSep()
	}
	
	logArrayWithArg<T>(arg: string, value: T[], logger: (l: LogBuilder, v: T) => void) {
		this.addArg(arg)
		this.logArrayWith(value, logger)
	}
	
	logArraySepWithArg<T>(arg: string, value: T[], logger: (l: LogBuilder, v: T) => void) {
		this.logArrayWithArg(arg, value, logger)
		this.addSep()
	}
	
	logMapWith<K, V>(value: Map<K, V>, loggerK: (l: LogBuilder, v: K) => void, loggerV: (l: LogBuilder, v: V) => void) {
		this.string += '['
		let s = false
		value.forEach((v, k) => {
			if (s) {
				this.addSep()
			}
			else {
				s = true
			}
			this.logWith(k, loggerK)
			this.addCom()
			this.logWith(v, loggerV)
		})
		this.string += ']'
	}
	
	logMapSepWith<K, V>(value: Map<K, V>, loggerK: (l: LogBuilder, v: K) => void, loggerV: (l: LogBuilder, v: V) => void) {
		this.logMapWith(value, loggerK, loggerV)
		this.addSep()
	}
	
	logMapWithArg<K, V>(arg: string, value: Map<K, V>, loggerK: (l: LogBuilder, v: K) => void, loggerV: (l: LogBuilder, v: V) => void) {
		this.addArg(arg)
		this.logMapWith(value, loggerK, loggerV)
	}
	
	logMapSepWithArg<K, V>(arg: string, value: Map<K, V>, loggerK: (l: LogBuilder, v: K) => void, loggerV: (l: LogBuilder, v: V) => void) {
		this.logMapWithArg(arg, value, loggerK, loggerV)
		this.addSep()
	}
	
	private addArg(arg: string) {
		this.string += arg
		this.addCom()
	}
	
	private addCom() {
		this.string += ': '
	}
	
	private addSep() {
		this.string += ', '
	}
	
}