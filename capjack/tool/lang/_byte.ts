import {Long} from './Long'
import {IllegalArgumentException} from './exceptions/IllegalArgumentException'
import {IndexOutOfBoundsException} from './exceptions/IndexOutOfBoundsException'

export namespace _byte {
	export function putInt(target: Int8Array, offset: number, value: number) {
		target[offset] = value >>> 24
		target[offset + 1] = value >>> 16
		target[offset + 2] = value >>> 8
		target[offset + 3] = value
	}
	
	export function putLong(target: Int8Array, offset: number, value: Long) {
		putInt(target, offset, value.highBits)
		putInt(target, offset + 4, value.lowBits)
	}
	
	export function putBytes(target: Int8Array, offset: number, value: Int8Array) {
		const len = value.length
		let index = 0
		while (index < len) target[offset + index] = value[index++]
	}
	
	export function getInt(source: Int8Array, offset: number): number {
		return (source[offset] & 0xFF) << 24 | (source[offset + 1] & 0xFF) << 16 | (source[offset + 2] & 0xFF) << 8 | source[offset + 3] & 0xFF
	}
	
	export function getLong(source: Int8Array, offset: number): Long {
		let h = getInt(source, offset)
		let l = getInt(source, offset + 4)
		return Long.fromBits(l, h)
	}
	
	export function getBytes(source: Int8Array, offset: number, size: number): Int8Array {
		if (size < 0) throw new IllegalArgumentException(size.toString())
		const target = new Int8Array(size)
		let index = 0
		while (index < size) target[index] = source[offset + index++]
		
		return target
	}
	
	export function putSting(target: Int8Array, offset: number, value: string): number {
		const endIndex = value.length
		
		let byteIndex = offset
		let charIndex = 0
		
		while (charIndex < endIndex) {
			const code = value.charCodeAt(charIndex++)
			
			if (code < 0x80) {
				target[byteIndex++] = code
			}
			else if (code < 0x800) {
				target[byteIndex++] = code >> 6 | 0xC0
				target[byteIndex++] = code & 0x3F | 0x80
			}
			else if (code < 0xD800 || code >= 0xE000) {
				
				target[byteIndex++] = code >> 12 | 0xE0
				target[byteIndex++] = code >> 6 & 0x3F | 0x80
				target[byteIndex++] = code & 0x3F | 0x80
			}
			else {
				const codePoint = codePointFromSurrogate(value, code, charIndex, endIndex)
				
				if (codePoint <= 0) {
					target[byteIndex++] = 0xEF
					target[byteIndex++] = 0xBF
					target[byteIndex++] = 0xBD
				}
				else {
					target[byteIndex++] = codePoint >> 18 | 0xF0
					target[byteIndex++] = codePoint >> 12 & 0x3F | 0x80
					target[byteIndex++] = codePoint >> 6 & 0x3F | 0x80
					target[byteIndex++] = codePoint & 0x3F | 0x80
					charIndex++
				}
			}
		}
		
		return byteIndex - offset
	}
	
	export function getSting(source: Int8Array, offset: number, size: number): string {
		const endIndex = offset + size
		
		if (!(offset >= 0 && endIndex <= source.length && offset <= endIndex)) {
			throw new IndexOutOfBoundsException()
		}
		
		let byteIndex = offset
		let result = ''
		
		while (byteIndex < endIndex) {
			let byte = source[byteIndex++]
			if (byte >= 0) {
				result += String.fromCharCode(byte & 0xFFFF)
			}
			else {
				let code = 0
				if (byte >> 5 === -2) {
					code = codePointFrom2(source, byte, byteIndex, endIndex)
					if (code > 0) {
						result += String.fromCharCode(code & 0xFFFF)
						byteIndex += 1
					}
				}
				else if (byte >> 4 === -2) {
					code = codePointFrom3(source, byte, byteIndex, endIndex)
					if (code > 0) {
						result += String.fromCharCode(code & 0xFFFF)
						byteIndex += 2
					}
				}
				else if (byte >> 3 === -2) {
					code = codePointFrom4(source, byte, byteIndex, endIndex)
					if (code > 0) {
						let high = code - 0x10000 >> 10 | 0xD800
						let low = code & 0x3FF | 0xDC00
						result += String.fromCharCode(high & 0xFFFF)
						result += String.fromCharCode(low & 0xFFFF)
						byteIndex += 3
					}
				}
				
				if (code <= 0) {
					result += '\uFFFD'
					byteIndex += -code
				}
			}
		}
		return result
	}
	
	function codePointFromSurrogate(string: string, high: number, index: number, endIndex: number): number {
		if (!(0xD800 <= high && high <= 0xDBFF) || index >= endIndex) return 0
		const low = string.charCodeAt(index)
		if (!(0xDC00 <= low && low <= 0xDFFF)) return 0
		return 0x10000 + ((high & 0x3FF) << 10) | (low & 0x3FF)
	}
	
	function codePointFrom2(bytes, byte1, index, endIndex) {
		if ((byte1 & 0x1E) === 0 || index >= endIndex) return 0
		let byte2 = bytes[index]
		if ((byte2 & 0xC0) !== 0x80) return 0
		return byte1 << 6 ^ byte2 ^ 0xF80
	}
	
	function codePointFrom3(bytes, byte1, index, endIndex) {
		if (index >= endIndex) return 0
		let byte2 = bytes[index]
		if ((byte1 & 0xF) === 0) {
			if ((byte2 & 0xE0) !== 0xA0) return 0
		}
		else if ((byte1 & 0xF) === 0xD) {
			if ((byte2 & 0xE0) !== 0x80) return 0
		}
		else if ((byte2 & 0xC0) !== 0x80) {
			return 0
		}
		if (index + 1 === endIndex) return -1
		let byte3 = bytes[index + 1]
		if ((byte3 & 0xC0) !== 0x80) return -1
		return byte1 << 12 ^ byte2 << 6 ^ byte3 ^ -0x1E080
	}
	
	function codePointFrom4(bytes, byte1, index, endIndex) {
		if (index >= endIndex) return 0
		
		let byte2 = bytes[index]
		if ((byte1 & 0xF) === 0) {
			if ((byte2 & 0xF0) <= 0x80) return 0
		}
		else if ((byte1 & 0xF) === 0x4) {
			if ((byte2 & 0xF0) !== 0x80) return 0
		}
		else if ((byte1 & 0xF) > 0x4) {
			return 0
		}
		else if ((byte2 & 0xC0) !== 0x80) {
			return 0
		}
		if (index + 1 === endIndex) return -1
		let byte3 = bytes[index + 1]
		if ((byte3 & 0xC0) !== 0x80) return -1
		if (index + 2 === endIndex) return -2
		let byte4 = bytes[index + 2]
		if ((byte4 & 0xC0) !== 0x80) return -2
		
		return byte1 << 18 ^ byte2 << 12 ^ byte3 << 6 ^ byte4 ^ 0x381F80
	}
}

export const EMPTY_BYTE_ARRAY = new Int8Array(0)
