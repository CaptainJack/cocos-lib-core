import {Long} from '../capjack/tool/lang/Long'
import {isString} from '../capjack/tool/lang/_utils'
import {_string} from '../capjack/tool/lang/_string'
import {Label} from 'cc'
import {_number} from '../capjack/tool/lang/_number'

export enum TimePrecision {
	HOUR,
	MINUTE,
	SECOND,
}

export namespace _format {
	export function date(date: Date, format: string):string {
		let r = format
		if (_string.contains(r, 'd')) {
			r = r.replace('d', _string.padStart(date.getDate().toString(), 2, '0'))
		}
		if (_string.contains(r, 'm')) {
			r = r.replace('m', _string.padStart((date.getMonth() +1).toString(), 2, '0'))
		}
		if (_string.contains(r, 'Y')) {
			r = r.replace('Y', date.getFullYear().toString())
		}
		return r
	}
	
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
	
	export function formatFractionNumber(value: number | Long | string, precision: number, fixed: boolean, thousandthSeparator: string, fractionSeparator: string): string {
		if (value instanceof Long) {
			const s = formatIntegerNumber(value, thousandthSeparator)
			if (fixed) {
				return s + fractionSeparator + '0'.repeat(precision)
			}
			return s
		}
		if (isString(value)) {
			return value
		}
		
		if (fixed) {
			const v = value.toFixed(precision)
			if (precision == 0) {
				return formatIntegerNumber(v, thousandthSeparator)
			}
			const i = v.indexOf('.')
			return formatIntegerNumber(v.substring(0, i), thousandthSeparator) + fractionSeparator + v.substring(i + 1)
		}
		
		let v = value.toString()
		let s1 = _string.substringBefore(v, '.')
		let s2 = _string.substringAfter(v, '.', null)
		
		if (precision == 0 || s2 === null) {
			return s1
		}
		
		return formatIntegerNumber(s1, thousandthSeparator) + fractionSeparator + s2
	}
	
	export function defineWordDeclinationRu(number: number, word1: string, word2: string, word5: string): string {
		if (number % 100 > 10 && number % 100 < 15) {
			return word5
		}
		
		let last: number
		if (_number.isDouble(number)) {
			if (number > 1 && number < 2) {
				last = 2
			}
			else {
				const str: string = (number | 0).toString()
				last = parseInt(str.charAt(str.length - 1))
			}
		}
		else {
			const str: string = number.toString()
			last = parseInt(str.charAt(str.length - 1))
		}
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
