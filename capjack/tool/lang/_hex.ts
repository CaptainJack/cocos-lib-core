import {Long} from './Long'

export namespace _hex {
	const HEX_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
	
	export function byteToHexString(value: number): string {
		value = value & 0xFF
		return HEX_CHARS[value >> 4] + HEX_CHARS[value & 0x0F]
	}
	
	export function bytesToHexString(value: Int8Array, offset: number = 0, size: number = value.length): string {
		if (value.length == 0) {
			return ''
		}
		let s = ''
		for (let i = offset, e = offset + size; i < e; i++) {
			s += byteToHexString(value[i])
		}
		
		return s
	}
	
	export function intToHexString(value: number): string {
		let s = ''
		for (let i = 7; i >= 0; i--) {
			s += HEX_CHARS[value >>> (i * 4) & 0x0F]
		}
		return s
	}
	
	export function longToHexString(value: Long): string {
		return intToHexString(value.highBits) + intToHexString(value.lowBits)
	}
}