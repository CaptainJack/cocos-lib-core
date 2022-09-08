import {Record} from "./Record";
import {Output} from "./Output";

export class ProxyOutput implements Output {
	constructor(public target: Output) {
	}
	
	writeRecord(record: Record): void {
		this.target.writeRecord(record)
	}
}