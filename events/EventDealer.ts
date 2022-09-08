import {Class} from '../capjack/tool/lang/_types'
import {Cancelable} from '../capjack/tool/utils/Cancelable'

export interface EventDealer<E> {
	on<T extends E>(type: Class<T>, receiver: (event: T) => void, target?: any): Cancelable
	
	on<T extends E>(type: T, receiver: (event: T) => void, target?: any): Cancelable
	
	once<T extends E>(type: Class<T>, receiver: (event: T) => void, target?: any): Cancelable
	
	once<T extends E>(type: T, receiver: (event: T) => void, target?: any): Cancelable
}