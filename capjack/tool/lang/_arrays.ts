import {isFunction} from './_utils'
import {NoSuchElementException} from './exceptions/NoSuchElementException'
import {Class} from './_types'
import {UnsupportedOperationException} from './exceptions/UnsupportedOperationException'

export const EMPTY_ARRAY = []

EMPTY_ARRAY.push =
EMPTY_ARRAY.pop =
EMPTY_ARRAY.shift =
EMPTY_ARRAY.sort =
EMPTY_ARRAY.splice =
EMPTY_ARRAY.unshift = function () {
	throw new UnsupportedOperationException()
}


export namespace _array {
	export const ORDER_NUMBER_NATURAL = (a: number, b: number) => a === b ? 0 : (a > b ? 1 : -1)
	
	function messageCollectionIsEmpty() {
		return 'Collection is empty.'
	}
	
	export function subBefore(collection: Array<number>, value: number, inclusive: boolean = false) {
		let i = collection.indexOf(value)
		if (inclusive) i++
		return collection.slice(0, i)
	}
	
	export function copy<T>(source: ArrayLike<T>, target: Array<T>, targetOffset: number = 0, startIndex: number = 0, endIndex: number = source.length) {
		let sourceIndex = startIndex
		let targetIndex = targetOffset
		while (sourceIndex < endIndex) {
			target[targetIndex++] = source[sourceIndex++]
		}
	}
	
	export function contains<T>(collection: Array<T>, element: T): boolean {
		return collection.indexOf(element) !== -1
	}
	
	export function containsAny<T>(collection: ArrayLike<T>, ...elements: Array<T>): boolean {
		const el = elements.length
		for (let ci = 0, cl = collection.length; ci < cl; ci++) {
			const c = collection[ci]
			for (let ei = 0; ei < el; ei++) {
				if (c == elements[ei]) {
					return true
				}
			}
		}
		
		return false
	}
	
	export function indexOf<T>(collection: ArrayLike<T>, predicate: (element: T) => boolean): number {
		for (let i = 0, l = collection.length; i < l; i++) {
			if (predicate(collection[i])) {
				return i
			}
		}
		return -1
	}
	
	export function none<T>(collection: ArrayLike<T>, predicate: T | ((element: T) => boolean)): boolean {
		return !any(collection, predicate)
	}
	
	export function any<T>(collection: ArrayLike<T>, predicate: T | ((element: T) => boolean)): boolean {
		if (isFunction(predicate)) {
			return indexOf(collection, predicate) !== -1
		}
		
		for (let i = 0, l = collection.length; i < l; i++) {
			if (predicate == collection[i]) {
				return true
			}
		}
		
		return false
	}
	
	export function all<T>(collection: ArrayLike<T>, predicate: T | ((element: T) => boolean)): boolean {
		if (isFunction(predicate)) {
			for (let i = 0, l = collection.length; i < l; i++) {
				if (!predicate(collection[i])) {
					return false
				}
			}
		}
		else {
			for (let i = 0, l = collection.length; i < l; i++) {
				if (predicate != collection[i]) {
					return false
				}
			}
		}
		return true
	}
	
	export function isEmpty(collection: ArrayLike<any>): boolean {
		return collection.length === 0
	}
	
	export function isNotEmpty(collection: ArrayLike<any>): boolean {
		return collection.length !== 0
	}
	
	export function find<T>(collection: Array<T>, predicate: (element: T) => boolean): T | null {
		for (const e of collection) {
			if (predicate(e)) {
				return e
			}
		}
		return null
	}
	
	export function first<T>(collection: ArrayLike<T>): T {
		if (isEmpty(collection)) throw new NoSuchElementException(messageCollectionIsEmpty())
		return collection[0]
	}
	
	export function last<T>(collection: ArrayLike<T>): T {
		if (isEmpty(collection)) throw new NoSuchElementException(messageCollectionIsEmpty())
		return collection[collection.length - 1]
	}
	
	export function middle<T>(collection: ArrayLike<T>): T {
		if (isEmpty(collection)) throw new NoSuchElementException(messageCollectionIsEmpty())
		const half = collection.length / 2 | 0
		return collection[half]
	}
	
	export function getOrLast<T>(collection: ArrayLike<T>, i: number): T {
		return collection.length > i ? collection[i] : last(collection)
	}
	
	export function flatMap<T, R>(collection: ArrayLike<T>, transform: (element: T) => Array<R>): Array<R> {
		const result = []
		for (let i = 0, l = collection.length; i < l; i++) {
			const array = transform(collection[i])
			result.push(...array)
		}
		return result
	}
	
	export function sum<T>(collection: ArrayLike<number>): number {
		let result = 0
		for (let i = 0, l = collection.length; i < l; i++) {
			result += collection[i]
		}
		return result
	}
	
	export function sumOf<T>(collection: ArrayLike<T>, selector: (element: T, index: number) => number): number {
		let result = 0
		for (let i = 0, l = collection.length; i < l; i++) {
			result += selector(collection[i], i)
		}
		return result
	}
	
	export function remove<T>(collection: Array<T>, element: T | ((e: T) => boolean)): boolean {
		let i: number = -1
		if (isFunction(element)) {
			for (let q = 0; q < collection.length; q++) {
				if (element(collection[q])) {
					i = q
					break
				}
			}
		}
		else {
			i = collection.indexOf(element)
		}
		
		if (i === -1) return false
		collection.splice(i, 1)
		return true
	}
	
	export function removeAll<T>(collection: Array<T>, element: T | ((e: T) => boolean)): boolean {
		if (isFunction(element)) {
			let i: Array<number> = []
			for (let q = 0; q < collection.length; q++) {
				if (element(collection[q])) {
					i.push(q)
				}
			}
			if (i.length === 0) return false
			do {
				collection.splice(i.pop(), 1)
			}
			while (i.length > 0)
			return true
		}
		
		let i = collection.indexOf(element)
		if (i === -1) return false
		do {
			collection.splice(i, 1)
			i = collection.indexOf(element)
		}
		while (i !== -1)
		return true
	}
	
	export function shuffle<T>(collection: Array<T>): Array<T> {
		let currentIndex = collection.length
		let randomIndex
		
		while (currentIndex != 0) {
			randomIndex = Math.floor(Math.random() * currentIndex)
			currentIndex--;
			
			[collection[currentIndex], collection[randomIndex]] = [collection[randomIndex], collection[currentIndex]]
		}
		
		return collection
	}
	
	export function addDistinct<T>(collection: Array<T>, value: T) {
		if (!contains(collection, value)) collection.push(value)
	}
	
	export function addDistinctMany<T>(collection: Array<T>, source: Array<T>) {
		for (const e of source) {
			if (!contains(collection, e)) collection.push(e)
		}
	}
	
	export function range(from: number, to: number, toInclusive: boolean = false): Array<number> {
		if (toInclusive) ++to
		const a = []
		for (let i = from; i < to; i++) a.push(i)
		return a
	}
	
	export function max(collection: Array<number>, predicate?: (element: number) => boolean): number | null {
		if (isEmpty(collection)) return null
		
		if (predicate) {
			return max(collection.filter(predicate))
		}
		
		let r = collection[0]
		for (const v of collection) {
			if (v > r) r = v
		}
		
		return r
	}
	
	export function min(collection: Array<number>, predicate?: (element: number) => boolean): number | null {
		if (isEmpty(collection)) return null
		
		if (predicate) {
			return min(collection.filter(predicate))
		}
		
		let r = collection[0]
		for (const v of collection) {
			if (v < r) r = v
		}
		
		return r
	}
	
	export function associate<T, K, V>(collection: ArrayLike<T>, keySelector: (element: T) => K, valueSelector: (element: T) => V): Map<K, V> {
		let map = new Map<K, V>()
		for (let i = 0, l = collection.length; i < l; i++) {
			let e = collection[i]
			map.set(keySelector(e), valueSelector(e))
		}
		return map
	}
	
	export function associateBy<T, K>(collection: ArrayLike<T>, keySelector: (element: T) => K): Map<K, T> {
		let map = new Map<K, T>()
		for (let i = 0, l = collection.length; i < l; i++) {
			let e = collection[i]
			map.set(keySelector(e), e)
		}
		return map
	}
	
	export function associateWith<K, V>(collection: ArrayLike<K>, valueSelector: (element: K) => V): Map<K, V> {
		let map = new Map<K, V>()
		for (let i = 0, l = collection.length; i < l; i++) {
			let e = collection[i]
			map.set(e, valueSelector(e))
		}
		return map
	}
	
	export function reverse<T>(collection: Array<T>): Array<T> {
		return collection.concat().reverse()
	}
	
	export function newIntArray(size: number): Array<number> {
		const array = new Array<number>(size)
		array.fill(0)
		return array
	}
	
	export function newWith<T>(size: number, element: (i: number) => T): Array<T> {
		const array = new Array<T>(size)
		for (let i = 0; i < size; i++) {
			array[i] = element(i)
		}
		return array
	}
	
	export function filterIsInstance<T, R extends T>(collection: Array<T>, type: Class<R>): Array<R> {
		return collection.filter(e => e instanceof type) as Array<R>
	}
}

declare global {
	interface Array<T> {
		distinct(): Array<T>
		
		onEach(code: (element: T, index: number) => void): Array<T>
	}
}

Array.prototype.distinct = function () {
	return Array.from(new Set(this))
}

Array.prototype.onEach = function (code: (element: any, index: number) => void) {
	for (let i = 0; i < this.length; i++){
		code(this[i], i)
	}
	return this
}