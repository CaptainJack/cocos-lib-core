import {Record} from "./Record";

export interface RecordFormatter {
	format(record: Record): String
}
	