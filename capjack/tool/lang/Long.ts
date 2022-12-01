import {isString} from './_utils'

export class Long {
	private static intCache: Array<Long> = new Array(256);
	
	static fromInt(value: number): Long {
		value = value | 0;
		if (value === -1) {
			let o = Long.intCache[255];
			if (o) return o;
			return Long.intCache[255] = new Long(-1, -1);
		}
		if (value >= 0 && value < 255) {
			let o = Long.intCache[value];
			if (o) return o;
			return Long.intCache[value] = new Long(value, 0);
		}
		return new Long(value, value < 0 ? -1 : 0);
	}
	
	static fromNumber(value: number): Long {
		if (isNaN(value)) return Long.ZERO;
		if (value >= -2147483648 && value <= 2147483647) return Long.fromInt(value);
		if (value <= -Long.TWO_PWR_63_DBL) return Long.MIN_VALUE;
		if (value + 1 >= Long.TWO_PWR_63_DBL) return Long.MAX_VALUE;
		if (value < 0) return Long.fromNumber(-value).negate();
		return new Long(value % Long.TWO_PWR_32_DBL, value / Long.TWO_PWR_32_DBL);
	}
	
	static fromBits(lowBits: number, highBits: number): Long {
		if (highBits == 0 && lowBits >= -1 && lowBits < 255) return Long.fromInt(lowBits);
		return new Long(lowBits, highBits);
	}
	
	static fromString(value: string): Long {
		let result = this.ZERO
		let power = Long.ONE
		for (let i = value.length - 1; i >= 0; i--) {
			let digit = parseInt(value[i])
			if (digit != 0) {
				result = result.plus(Long.fromInt(digit).multiply(power))
			}
			power = power.multiply(Long.TEN)
		}
		return result
	}
	
	static from(value: Long | number | string) : Long {
		if (value instanceof Long) return value
		if (isString(value)) return this.fromString(value)
		return this.fromNumber(value as number)
	}
	
	static ZERO = Long.fromInt(0);
	static ONE = Long.fromInt(1);
	static TEN = Long.fromInt(10);
	static NEG_ONE = Long.fromInt(-1);
	static MAX_VALUE = Long.fromBits(4.294967295E9, 2147483647);
	static MIN_VALUE = Long.fromBits(0, 2.147483648E9);
	
	private static TWO_PWR_16_DBL = 1 << 16;
	private static TWO_PWR_32_DBL = Long.TWO_PWR_16_DBL * Long.TWO_PWR_16_DBL;
	private static TWO_PWR_64_DBL = Long.TWO_PWR_32_DBL * Long.TWO_PWR_32_DBL;
	private static TWO_PWR_63_DBL = Long.TWO_PWR_64_DBL / 2;
	private static TWO_PWR_24 = Long.fromInt(1 << 24);
	
	//
	private readonly low: number;
	private readonly high: number;
	
	private constructor(low: number, high: number) {
		this.low = low | 0;
		this.high = high | 0;
	}
	
	get lowBitsUnsigned(): number {
		return this.low >= 0 ? this.low : Long.TWO_PWR_32_DBL + this.low;
	}
	
	get highBits(): number {
		return this.high;
	}
	
	get lowBits(): number {
		return this.low;
	}
	
	hashCode(): number {
		return this.high ^ this.low;
	}
	
	toInt(): number {
		return this.low;
	}
	
	toNumber(): number {
		return this.high * Long.TWO_PWR_32_DBL + this.lowBitsUnsigned;
	}
	
	toString(radix: number = 10): string {
		if (2 > radix || radix > 36) throw new Error('Radix out of range (2 - 36): ' + radix);
		if (this.isZero()) return '0';
		
		if (this.isNegative()) {
			if (this.equals(Long.MIN_VALUE)) {
				return '-9223372036854775808';
			}
			else {
				return '-' + this.negate().toString(radix);
			}
		}
		const radixToPower = Long.fromNumber(Math.pow(radix, 6));
		let rem: Long = this;
		let result = '';
		while (true) {
			const remDiv = rem.div(radixToPower);
			const int = rem.minus(remDiv.multiply(radixToPower)).toInt();
			let digits = int.toString(radix);
			rem = remDiv;
			
			if (rem.isZero()) return digits + result;
			
			while (digits.length < 6) {
				digits = '0' + digits;
			}
			result = '' + digits + result;
		}
	}
	
	isZero(): boolean {
		return this.high == 0 && this.low == 0;
	}
	
	isNotZero(): boolean {
		return !this.isZero()
	}
	
	isNegative(): boolean {
		return this.high < 0;
	}
	
	isOdd(): boolean {
		return (this.low & 1) == 1;
	}
	
	isHigh(): boolean {
		return this.high !== 0 || this.low < 0
	}
	
	equals(other: Long): boolean {
		return this.high == other.high && this.low == other.low;
	}
	
	less(other: Long): boolean {
		return this.compare(other) < 0;
	}
	
	lessOrEqual(other: Long): boolean {
		return this.compare(other) <= 0;
	}
	
	great(other: Long): boolean {
		return this.compare(other) > 0;
	}
	
	greatOrEqual(other: Long): boolean {
		return this.compare(other) >= 0;
	}
	
	greatOrEqualInt(other: number): boolean {
		if (this.isHigh()) {
			return this.greatOrEqual(Long.fromInt(other))
		}
		return this.low >= other
	}
	
	compare(other: Long): number {
		if (this.equals(other)) {
			return 0;
		}
		
		const thisNeg = this.isNegative();
		const otherNeg = other.isNegative();
		
		if (thisNeg && !otherNeg) return -1;
		if (!thisNeg && otherNeg) return 1;
		if (this.minus(other).isNegative()) return -1;
		
		return 1;
	}
	
	
	negate(): Long {
		if (this.equals(Long.MIN_VALUE)) {
			return Long.MIN_VALUE;
		}
		else {
			return this.not().plus(Long.ONE);
		}
	}
	
	abs(): Long {
		if (this.isNegative()) return this.negate()
		return this
	}
	
	plus(other: Long): Long {
		if (other.isZero()) {
			return this
		}
		if (this.isZero()) {
			return other
		}
		
		const
			a48 = this.high >>> 16,
			a32 = this.high & 65535,
			a16 = this.low >>> 16,
			a00 = this.low & 65535,
			b48 = other.high >>> 16,
			b32 = other.high & 65535,
			b16 = other.low >>> 16,
			b00 = other.low & 65535;
		let c48 = 0, c32 = 0, c16 = 0, c00 = 0;
		c00 += a00 + b00;
		c16 += c00 >>> 16;
		c00 &= 65535;
		c16 += a16 + b16;
		c32 += c16 >>> 16;
		c16 &= 65535;
		c32 += a32 + b32;
		c48 += c32 >>> 16;
		c32 &= 65535;
		c48 += a48 + b48;
		c48 &= 65535;
		return Long.fromBits(c16 << 16 | c00, c48 << 16 | c32);
	}
	
	plusInt(other: number): Long {
		return this.plus(Long.fromInt(other))
	}
	
	plusNumber(other: number): Long {
		return this.plus(Long.fromNumber(other))
	}
	
	minus(other: Long): Long {
		return this.plus(other.negate())
	}
	
	minusInt(other: number): Long {
		if (this.isHigh()) {
			return this.minus(Long.fromInt(other))
		}
		return Long.fromInt(this.low - other)
	}
	
	minusNumber(other: number): Long {
		return this.minus(Long.fromNumber(other))
	}
	
	// noinspection DuplicatedCode
	multiply(other: Long): Long {
		if (this.isZero() || other.isZero()) return Long.ZERO;
		
		if (this.equals(Long.MIN_VALUE)) return other.isOdd() ? Long.MIN_VALUE : Long.ZERO;
		if (other.equals(Long.MIN_VALUE)) return this.isOdd() ? Long.MIN_VALUE : Long.ZERO;
		
		if (this.isNegative()) return other.isNegative() ? this.negate().multiply(other.negate()) : this.negate().multiply(other).negate();
		if (other.isNegative()) return this.multiply(other.negate()).negate();
		
		if (this.less(Long.TWO_PWR_24) && other.less(Long.TWO_PWR_24)) return Long.fromNumber(this.toNumber() * other.toNumber());
		
		const
			a48 = this.high >>> 16,
			a32 = this.high & 65535,
			a16 = this.low >>> 16,
			a00 = this.low & 65535,
			b48 = other.high >>> 16,
			b32 = other.high & 65535,
			b16 = other.low >>> 16,
			b00 = other.low & 65535;
		
		let c48 = 0, c32 = 0, c16 = 0, c00 = 0;
		
		
		c00 += a00 * b00;
		c16 += c00 >>> 16;
		c00 &= 65535;
		c16 += a16 * b00;
		c32 += c16 >>> 16;
		c16 &= 65535;
		c16 += a00 * b16;
		c32 += c16 >>> 16;
		c16 &= 65535;
		c32 += a32 * b00;
		c48 += c32 >>> 16;
		c32 &= 65535;
		c32 += a16 * b16;
		c48 += c32 >>> 16;
		c32 &= 65535;
		c32 += a00 * b32;
		c48 += c32 >>> 16;
		c32 &= 65535;
		c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
		c48 &= 65535;
		
		return Long.fromBits(c16 << 16 | c00, c48 << 16 | c32);
	}
	
	multiplyNumber(other: number): Long {
		if (other === 0) return Long.ZERO
		if (other === 1) return this
		if (other === -1) return this.negate()
		
		return this.multiply(Long.fromNumber(other))
	}
	
	div(other: Long): Long {
		if (other.isZero()) throw new Error('Division by zero');
		if (this.isZero()) return Long.ZERO;
		
		if (this.equals(Long.MIN_VALUE)) {
			if (other.equals(Long.ONE) || other.equals(Long.NEG_ONE)) return Long.MIN_VALUE;
			if (other.equals(Long.MIN_VALUE)) return Long.ONE;
			
			const halfThis = this.shiftRight(1);
			const approx = halfThis.div(other).shiftLeft(1);
			
			if (approx.equals(Long.ZERO)) return other.isNegative() ? Long.ONE : Long.NEG_ONE;
			
			const rem: Long = this.minus(other.multiply(approx));
			return approx.plus(rem.div(other));
		}
		
		if (other.equals(Long.MIN_VALUE)) return Long.ZERO;
		
		if (this.isNegative()) return other.isNegative() ? this.negate().div(other.negate()) : this.negate().div(other).negate();
		if (other.isNegative()) return this.div(other.negate()).negate();
		
		let res:Long = Long.ZERO;
		let rem: Long = this;
		while (rem.greatOrEqual(other)) {
			let approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
			const log2 = Math.ceil(Math.log(approx) / Math.LN2);
			const delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48);
			let approxRes = Long.fromNumber(approx);
			let approxRem = approxRes.multiply(other);
			while (approxRem.isNegative() || approxRem.great(rem)) {
				approx -= delta;
				approxRes = Long.fromNumber(approx);
				approxRem = approxRes.multiply(other);
			}
			if (approxRes.isZero()) {
				approxRes = Long.ONE;
			}
			res = res.plus(approxRes);
			rem = rem.minus(approxRem);
		}
		return res;
	}
	
	divNumber(other: number): Long {
		if (this.isHigh()) {
			return this.div(Long.fromNumber(other))
		}
		return Long.fromInt(Math.floor(this.low / other))
	}
	
	modulo(other: Long): Long {
		return this.minus(this.div(other).multiply(other));
	}
	
	moduloNumber(other: number): Long {
		return this.minus(this.divNumber(other).multiplyNumber(other));
	}
	
	not(): Long {
		return Long.fromBits(~this.low, ~this.high);
	}
	
	and(other: Long): Long {
		return Long.fromBits(this.low & other.low, this.high & other.high);
	}
	
	or(other: Long): Long {
		return Long.fromBits(this.low | other.low, this.high | other.high);
	};
	
	xor(other: Long): Long {
		return Long.fromBits(this.low ^ other.low, this.high ^ other.high);
	};
	
	shiftLeft(numBits: number): Long {
		numBits &= 63;
		if (numBits == 0) return this;
		
		const low = this.low;
		if (numBits < 32) {
			let l = low << numBits
			return Long.fromBits(l, this.high << numBits | low >>> 32 - numBits);
		}
		
		return Long.fromBits(0, low << numBits - 32);
	};
	
	shiftRight(numBits: number): Long {
		numBits &= 63;
		if (numBits == 0) return this;
		
		const high = this.high;
		if (numBits < 32) return Long.fromBits(this.low >>> numBits | high << 32 - numBits, high >> numBits);
		
		return Long.fromBits(high >> numBits - 32, high >= 0 ? 0 : -1);
	}
	
	shiftRightUnsigned(numBits: number): Long {
		numBits &= 63;
		
		if (numBits == 0) return this;
		
		const high = this.high;
		if (numBits < 32) return Long.fromBits(this.low >>> numBits | high << 32 - numBits, high >>> numBits);
		if (numBits == 32) return Long.fromBits(high, 0);
		
		return Long.fromBits(high >>> numBits - 32, 0);
	}
	
	increment(): Long {
		return this.plus(Long.ONE);
	}
	
	decrement(): Long {
		return this.plus(Long.NEG_ONE);
	}
}