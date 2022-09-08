import {Record} from "./Record";

export interface Output {
	writeRecord(record: Record): void
}