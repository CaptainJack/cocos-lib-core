import {RecordFormatter} from './RecordFormatter'
import {NameAbbreviator} from './NameAbbreviator'
import {Level} from './Level'
import {Record} from './Record'
import {_string} from '../lang/_string'

export class ConsoleOutputFormatter implements RecordFormatter {
	private readonly abbreviator: NameAbbreviator
	
	constructor(nameLengthLimit: number = 64) {
		this.abbreviator = new NameAbbreviator(nameLengthLimit)
	}
	
	format(record: Record): String {
		const level = _string.padEnd(Level[record.level], 5, ' ')
		const logger = this.abbreviator.abbreviate(record.logger)
		const time = formatTime(record.time)
		
		let result = `${time} ${level} ${logger}: ${record.message}`
		
		if (record.error) {
			result += '\n' + record.error.stack
		}
		
		return result
	}
}

function formatTime(ms: number) {
	let i = 0 | ms
	let s = 0 | i / 1000
	i -= s * 1000
	let m = 0 | s / 60
	s -= m * 60
	let h = 0 | m / 60
	m -= h * 60
	
	return _string.padStart(h.toString(), 2, '0') +
		':' + _string.padStart(m.toString(), 2, '0') +
		':' + _string.padStart(s.toString(), 2, '0') +
		'.' + _string.padStart(i.toString(), 3, '0')
}