import {Level} from "./Level";

export class Record {
	constructor(
		readonly time: number,
		readonly logger: string,
		readonly level: Level,
		readonly message: string,
		readonly error?: Error
	) {
	}
}