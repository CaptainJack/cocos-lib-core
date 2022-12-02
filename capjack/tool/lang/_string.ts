import {_byte} from './_byte'
import {best, isNullable, isString} from './_utils'

export namespace _string {
	
	export function trimStart(value: string, chars?: string) {
		if (isNullable(chars)) {
			while (true) {
				if (isWhitespaceChar(value.charAt(0))) {
					value = value.substring(1)
				}
				else {
					break
				}
			}
		}
		
		while (true) {
			if (contains(chars, value.charAt(0))) {
				value = value.substring(1)
			}
			else {
				break
			}
		}
		
		return value
	}
	
	export function trimEnd(value: string, chars?: string) {
		if (isNullable(chars)) {
			while (true) {
				if (isWhitespaceChar(value.charAt(value.length - 1))) {
					value = value.substring(0, value.length - 1)
				}
				else {
					break
				}
			}
		}
		
		while (true) {
			if (contains(chars, value.charAt(value.length - 1))) {
				value = value.substring(0, value.length - 1)
			}
			else {
				break
			}
		}
		
		return value
	}
	
	export function isWhitespaceChar(c: string): boolean {
		return c === ' '
			|| c === '\n'
			|| c === '\t'
			|| c === '\r'
			|| c === '\f'
			|| c === '\v'
			|| c === '\u00a0'
			|| c === '\u1680'
			|| c === '\u2000'
			|| c === '\u200a'
			|| c === '\u2028'
			|| c === '\u2029'
			|| c === '\u202f'
			|| c === '\u205f'
			|| c === '\u3000'
			|| c === '\ufeff'
	}
	
	export function isBlank(value: string): boolean {
		return isString(value) ? value.trim().length == 0 : true
	}
	
	export function encodeUtf8(value: string): Int8Array {
		const array = new Int8Array(value.length * 4)
		const size = _byte.putSting(array, 0, value)
		return array.subarray(0, size)
	}
	
	export function decodeUtf8(value: Int8Array): string {
		return _byte.getSting(value, 0, value.length)
	}
	
	export function substringBefore(value: string, delimiter: string, missing?: string): string {
		const i = value.indexOf(delimiter)
		return i === -1 ? best(missing, value) : value.substring(0, i)
	}
	
	export function substringAfter(value: string, delimiter: string, missing?: string): string {
		const i = value.indexOf(delimiter)
		return i === -1 ? best(missing, value) : value.substring(i + delimiter.length)
	}
	
	export function substringBeforeLast(value: string, delimiter: string, missing?: string): string {
		const i = value.lastIndexOf(delimiter)
		return i === -1 ? best(missing, value) : value.substring(0, i)
	}
	
	export function substringAfterLast(value: string, delimiter: string, missing?: string): string {
		const i = value.lastIndexOf(delimiter)
		return i === -1 ? best(missing, value) : value.substring(i + delimiter.length)
	}
	
	export function padStart(value: string, length: number, char: string): string {
		if (value.length >= length) return value
		return repeat(char, value.length - length) + value
	}
	
	export function padEnd(value: string, length: number, char: string): string {
		if (value.length >= length) return value
		return value + repeat(char, value.length - length)
	}
	
	export function repeat(value: string, length: number): string {
		if (length === 0) return ''
		if (length === 1) return value
		let result = value
		while (--length > 0) {
			result += value
		}
		return result
	}
	
	export function startsWith(value: string, prefix: string | Array<string>): boolean {
		if (isString(prefix)) {
			return value.indexOf(prefix) === 0
		}
		for (const p of prefix) {
			if (value.indexOf(p) === 0) return true
		}
		return false
	}
	
	export function endsWith(value: string, suffix: string | Array<string>): boolean {
		if (isString(suffix)) {
			return value.indexOf(suffix) === value.length - suffix.length
		}
		for (const s of suffix) {
			if (value.indexOf(s) === value.length - s.length) return true
		}
		return false
	}
	
	export function startWith(value: string, prefix: string): string {
		return startsWith(value, prefix) ? value : (prefix + value)
	}
	
	export function endWith(value: string, suffix: string): string {
		return endsWith(value, suffix) ? value : (value + suffix)
	}
	
	export function contains(value: string, part: string) {
		return value.indexOf(part) !== -1
	}
	
}