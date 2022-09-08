export function byte(v: number): number {
	return v & 0xFF
}

export namespace double {
	let buf: ArrayBuffer
	let bufFloat64: Float64Array
	let bufInt8: Int8Array
	let revers: boolean = false
	
	function init() {
		if (buf === undefined) {
			buf = new ArrayBuffer(8);
			bufFloat64 = new Float64Array(buf);
			bufInt8 = new Int8Array(buf);
			
			bufFloat64[0] = -1
			if (bufInt8[0] == 0) {
				revers = true
			}
		}
	}
	
	function pass(to, from) {
		if (revers) {
			to[7] = from[0]
			to[6] = from[1]
			to[5] = from[2]
			to[4] = from[3]
			to[3] = from[4]
			to[2] = from[5]
			to[1] = from[6]
			to[0] = from[7]
		}
		else {
			to[0] = from[0]
			to[1] = from[1]
			to[2] = from[2]
			to[3] = from[3]
			to[4] = from[4]
			to[5] = from[5]
			to[6] = from[6]
			to[7] = from[7]
		}
	}
	
	export function fromBytes(array: Int8Array) {
		init()
		pass(bufInt8, array)
		return bufFloat64[0]
	}
	
	export function toBytes(value: number, array: Int8Array) {
		init()
		bufFloat64[0] = value
		pass(array, bufInt8)
	}
	
}