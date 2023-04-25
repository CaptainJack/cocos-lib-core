import {Stoppable} from '../capjack/tool/utils/Stoppable'
import {Cancelable} from '../capjack/tool/utils/Cancelable'
import {AudioClip} from 'cc'

export interface Audio extends Volumeable {
	play(clip: string | AudioClip, settings?: SoundSettings): Sound
	
	prepare(clip: string | AudioClip, settings?: SoundSettings): Sound
	
	shot(clip: string | AudioClip)
	
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
	smoothStart?: number
	smoothStop?: number
	jumps?: Array<number>
}

export interface Volumeable extends Stoppable {
	getVolume(): number
	
	setVolume(volume: number)
	
	smoothVolume(duration: number, volume: number): Promise<void>
	
	smoothVolume(duration: number, from: number, to: number): Promise<void>
}