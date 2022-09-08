import {Output} from "./Output";
import {RecordFormatter} from "./RecordFormatter";
import {Record} from "./Record";
import {Level} from "./Level";

export class ConsoleOutput implements Output {
	constructor(private readonly formatter: RecordFormatter) {
	}
	
	writeRecord(record: Record): void {
		const message = this.formatter.format(record);
		
		switch (record.level) {
			case Level.ERROR:
				console.error(message);
				break;
			case Level.WARN:
				console.warn(message);
				break;
			case Level.INFO:
				console.info(message);
				break;
			case Level.DEBUG:
				console.log(message);
				break;
			case Level.TRACE:
				console.log(message);
				break;
		}
	}
}