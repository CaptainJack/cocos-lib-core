import {Stoppable} from '../capjack/tool/utils/Stoppable'
import {Cancelable} from '../capjack/tool/utils/Cancelable'

export interface Audio extends Volumeable {
	play(name: string, settings?: SoundSettings): Sound
	
	prepare(name: string, settings?: SoundSettings): Sound
	
	shot(name: string)
	
	getDuration(name): number
	
	onVolume(handler: (volume: number) => void): Cancelable
}

export interface Sound extends Volumeable {
	readonly name: string
	readonly duration: number
	
	pause()
	
	play(from?: number)
}

export interface SoundSettings {
	loop?: boolean
	smooth?: number
	jumps?: Array<number>,
}

export interface Volumeable extends Stoppable {
	getVolume(): number
	
	setVolume(volume: number)
	
	smoothVolume(duration: number, volume: number): Promise<void>
	
	smoothVolume(duration: number, from: number, to: number): Promise<void>
}