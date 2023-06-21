import {IllegalStateException} from './exceptions/IllegalStateException'
import {IllegalArgumentException} from './exceptions/IllegalArgumentException'

export const EMPTY_FUNCTION = () => {}

export const EMPTY_FUNCTION_TRUE = () => true
export const EMPTY_FUNCTION_FALSE = () => false

export function isBoolean(value: any): value is boolean {
	const type = typeof value
	return type === 'boolean' || (type === 'object' && value != null && !Array.isArray(value) && toString.call(value) == '[object Boolean]')
}

export function isString(value: any): value is string {
	const type = typeof value
	return type === 'string' || (type === 'object' && value != null && !Array.isArray(value) && toString.call(value) == '[object String]')
}

export function isFunction(value: any): value is Function {
	const type = typeof value
	return type === 'function' || (type === 'object' && value != null && !Array.isArray(value) && toString.call(value) == '[object Function]')
}

export function isNumber(value: any): value is number {
	const type = typeof value
	return type === 'number' || (type === 'object' && value != null && !Array.isArray(value) && toString.call(value) == '[object Number]')
}

export function isEmpty(value: any): boolean {
	return value === null || value === undefined || value === 0 || value === ''
}

export function isNullable(value: any): boolean {
	return value === null || value === undefined
}

export function notNullable(value: any): boolean {
	return !isNullable(value)
}

export function asNullable<T>(value: T | null | undefined): T | null {
	return isNullable(value) ? null : value
}

export function best<T>(primary: T | null | undefined, secondary: T): T {
	return (primary === undefined) ? secondary : primary
}

export function letOfNullable<T, R>(value: T | null | undefined, other: R, action: (value: T) => R): R {
	if (isNullable(value)) return other
	return action(value)
}

export function repeat(times: number, code: (iteration: number) => void) {
	for (let i = 0; i < times; i++) {
		code(i)
	}
}

export function check(condition: boolean) {
	if (!condition) {
		throw new IllegalStateException('Check failed')
	}
}

export function checkNotNullable<T>(value: T): T {
	if (isNullable(value)) {
		throw new IllegalStateException('Required value was null')
	}
	return value
}

export function require(condition: boolean) {
	if (!condition) {
		throw new IllegalArgumentException('Failed requirement')
	}
}

export function requireNotNullable<T>(value: T): T  {
	if (isNullable(value)) {
		throw new IllegalArgumentException('Required value was null')
	}
	return value
}