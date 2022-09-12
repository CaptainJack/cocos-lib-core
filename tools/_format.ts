import {Long} from '../capjack/tool/lang/Long'
import {isString} from '../capjack/tool/lang/_utils'
import {_string} from '../capjack/tool/lang/_string'
import {Label} from 'cc'

export enum TimePrecision {
	HOUR,
	MINUTE,
	SECOND,
}

export namespace _format {
	
	
	export function time(seconds: number, precision: TimePrecision): string {
		const h = seconds / 3600 | 0
		seconds -= h * 3600
		
		const m = seconds / 60 | 0
		seconds -= m * 60
		
		const s = seconds
		
		let r = ''
		
		const hv = precision == TimePrecision.HOUR || h > 0
		if (hv) {
			r += _string.padStart(h.toString(), 2, '0') + ':'
		}
		if (hv || precision == TimePrecision.MINUTE || m > 0) {
			r += _string.padStart(m.toString(), 2, '0') + ':'
		}
		
		return r + _string.padStart(s.toString(), 2, '0')
	}
	
	export function putDollarValueToLabel(label: Label, value: string | number | Long) {
		// @ts-ignore
		if (!label.stringTemplate) label.stringTemplate = label.string
		
		// @ts-ignore
		label.string = label.stringTemplate.replace('$', value)
	}
	
	export function formatIntegerNumber(value: number | Long | string, thousandthSeparator: string): string {
		let v = value.toString()
		for (let i = v.length - 3; i > 0; i -= 3) {
			v = v.substring(0, i) + thousandthSeparator + v.substring(i, v.length)
		}
		return v
	}
	
	export function formatFractionNumber(value: number | Long | string, precision: number, thousandthSeparator: string, fractionSeparator: string): string {
		if (value instanceof Long) {
			return formatIntegerNumber(value, ' ') + fractionSeparator + '0'.repeat(precision)
		}
		if (isString(value)) {
			return value
		}
		
		const v = value.toFixed(precision)
		if (precision == 0) {
			return formatIntegerNumber(v, thousandthSeparator)
		}
		const i = v.indexOf('.')
		return formatIntegerNumber(v.substring(0, i), thousandthSeparator) + fractionSeparator + v.substring(i + 1)
		
	}
	
	export function defineWordDeclinationRu(number: number, word1: string, word2: string, word5: string): string {
		if (number % 100 > 10 && number % 100 < 15) {
			return word5
		}
		
		const str: string = number.toString()
		const last: number = parseInt(str.charAt(str.length - 1))
		if (last == 1) {
			return word1
		}
		
		if (last != 0 && last < 5) {
			return word2
		}
		
		return word5
	}
	
	export function defineWordDeclinationEn(number: number, word1: string, word2: string): string {
		return number == 1 ? word1 : word2
	}
	
}
