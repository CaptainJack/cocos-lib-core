export const EMPTY_ARRAY = []

import {NoSuchElementException} from './exceptions/NoSuchElementException'

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
	
	export function indexOf<T>(collection: ArrayLike<T>, predicate: (element: T) => boolean): number {
		for (let i = 0, l = collection.length; i < l; i++) {
			if (predicate(collection[i])) {
				return i
			}
		}
		return -1
	}
	
	export function any<T>(collection: ArrayLike<T>, predicate: (element: T) => boolean): boolean {
		return indexOf(collection, predicate) !== -1
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
	
	export function remove<T>(collection: Array<T>, element: T): boolean {
		const i = collection.indexOf(element)
		if (i === -1) return false
		collection.splice(i, 1)
		return true
	}
	
	export function removeAll<T>(collection: Array<T>, element: T): boolean {
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
	
	export function addAllDistinct<T>(collection: Array<T>, source: Array<T>) {
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
}