import {InputByteBuffer} from '../../../tool/io/InputByteBuffer'
import {_hex} from '../../../tool/lang/_hex'

export function formatLoggerMessageBytesByte(prefix: String, data: number) {
	return `${prefix} 1B\n| ${_hex.byteToHexString(data)}`
}

export function formatLoggerMessageBytesBuffer(prefix: String, data: InputByteBuffer) {
	let view = data.arrayView
	return formatLoggerMessageBytes(prefix, view.array, view.readerIndex, data.readableSize)
}

export function formatLoggerMessageBytesArray(prefix: String, data: Int8Array) {
	return formatLoggerMessageBytes(prefix, data, 0, data.length)
}

function formatLoggerMessageBytes(prefix: String, data: Int8Array, offset: number, size: number) {
	let m = `${prefix} of ${size}B`
	
	if (size > 0 && size <= 128) {
		m += '\n| '
		let i = offset
		let p = 0
		let s = offset + size
		while (i < s) {
			m += _hex.byteToHexString(data[i++])
			if (++p < 16) {
				m += p == 8 ? '  ' : ' '
			}
			else {
				m += '\n| '
				p = 0
			}
		}
		
	}
	
	return m
}