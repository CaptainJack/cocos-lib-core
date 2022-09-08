import {BiserReader} from '../../tool/biser/BiserReader'

export interface CallbacksRegister {
	put(callback: (r: BiserReader, c: number) => void): number
	
	take(id: number): ((r: BiserReader, c: number) => void) | null
}