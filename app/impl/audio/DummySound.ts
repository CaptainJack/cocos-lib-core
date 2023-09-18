import {Sound} from '../../Audio'

export class DummySound implements Sound {
	
	public static INSTANCE = new DummySound()
	
	public get name(): string {
		return null
	}
	
	public get duration(): number {
		return 0
	}
	
	public getVolume(): number {
		return 0
	}
	
	public setVolume(value: number) {
	}
	
	public stop() {}
	
	public pause() {}
	
	public getCurrentTime():number {
		return 0
	}
	
	public play() {}
	
	public smoothVolume(duration: number, from: number, to?: number): Promise<void> {
		return Promise.resolve()
	}
}
