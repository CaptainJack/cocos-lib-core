import {RealSound} from './RealSound'

export interface SoundAdjuster {
	handleStart(): void
	
	handleEnd(): void
	
	handlePlay(): void
	
	handlePause(): boolean
	
	handleStop(): boolean
}

export class FadeSoundAdjuster implements SoundAdjuster {
	constructor(private sound: RealSound, private duration: number) {
	}
	
	public handlePlay(): void {
		this.sound.smoothVolume(this.duration, 0, 1)
	}
	
	public handleStart(): void {
	}
	
	public handlePause(): boolean {
		this.sound.smoothVolume(this.duration, 0).then(() => this.sound.doPause())
		return true
	}
	
	public handleStop(): boolean {
		if (this.sound) {
			this.sound.smoothVolume(this.duration, 0).then(() => this.sound && this.sound.doStop())
		}
		return true
	}
	
	public handleEnd(): void {
		this.sound = null
		this.duration = null
	}
}

export class FadeStopSoundAdjuster implements SoundAdjuster {
	constructor(private sound: RealSound, private duration: number) {
	}
	
	public handlePlay(): void {
	}
	
	public handleStart(): void {
	}
	
	public handlePause(): boolean {
		return false
	}
	
	public handleStop(): boolean {
		if (this.sound) {
			this.sound.smoothVolume(this.duration, 0).then(() => this.sound && this.sound.doStop())
			
		}
		return true
	}
	
	public handleEnd(): void {
		this.sound = null
		this.duration = null
	}
}

export class JumpsSoundAdjuster implements SoundAdjuster {
	private nextPoint: number = 0
	
	constructor(private sound: RealSound, private points: Array<number>) {
	}
	
	public handlePlay(): void {
		const point = this.points[this.nextPoint++]
		if (this.nextPoint == this.points.length) {
			this.nextPoint = 0
		}
		this.sound.source.currentTime = point / 1000
	}
	
	public handleStart(): void {
	}
	
	public handleEnd(): void {
		this.sound = null
		this.points = null
	}
	
	public handlePause(): boolean {
		return false
	}
	
	public handleStop(): boolean {
		return false
	}
}