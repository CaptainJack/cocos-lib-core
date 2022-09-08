import {Queue} from './Queue'
import {INT_MAX_VALUE} from '../../lang/_number'
import {Exception} from '../../lang/exceptions/Exception'
import {IllegalArgumentException} from '../../lang/exceptions/IllegalArgumentException'
import {_array} from '../../lang/_arrays'

export class ArrayQueue<E> implements Queue<E> {
	private _size: number = 0
	private head: number = 0
	private tail: number = 0
	private capacity: number
	private array: Array<E>

	constructor(capacity: number = 10) {
		if (capacity < 0 || capacity > INT_MAX_VALUE) {
			throw new IllegalArgumentException(`Illegal capacity (${capacity})`)
		}
		
		this.capacity = capacity
		this.array = new Array<E>(capacity)
	}
	
	get size(): number {
		return this._size
	}
	
	isEmpty(): boolean {
		return this._size === 0;
	}
	
	clear() {
		this._size = 0
		this.head = 0
		this.tail = 0
		this.array.fill(null)
	}
	
	add(element: E): Boolean {
		this.ensureCapacity(this._size + 1)
		this.array[this.tail] = element
		this.tail = (this.tail + 1) % this.capacity
		this._size++
		return true
	}
	
	poll(): E | null {
		if (this._size == 0) {
			return null
		}
		
		let element = this.array[this.head]
		
		this.array[this.head] = null
		this.head = (this.head + 1) % this.capacity
		this._size--
		
		if (this._size == 0) {
			this.head = 0
			this.tail = 0
		}
		return element
	}
	
	private ensureCapacity(min: number) {
		if (min < 0 || min > INT_MAX_VALUE) {
			throw new Exception(`Out of memory (${min})`)
		}
		
		if (min > this.capacity) {
			let newCapacity = this.capacity + (this.capacity >> 1)
			
			if (newCapacity > INT_MAX_VALUE) {
				newCapacity = min
			}
			
			if (this.head < this.tail) {
				this.array.length = newCapacity
			}
			else {
				const newArray = new Array<E>(newCapacity)
				_array.copy(this.array, newArray, 0, this.head)
				_array.copy(this.array, newArray, this.capacity - this.head, 0, this.tail)
				
				this.array = newArray
				this.head = 0
				this.tail = this._size
			}
			
			this.capacity = newCapacity
		}
	}
}