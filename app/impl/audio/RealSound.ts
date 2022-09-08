import {AudioClip, AudioSource} from 'cc'
import {AbstractVolumeable} from './AbstractVolumeable'
import {FadeSoundAdjuster, JumpsSoundAdjuster, SoundAdjuster} from './SoundAdjuster'
import {RealSoundOwner} from './RealSoundOwner'
import {Sound, SoundSettings} from '../../Audio'
import {Tweener} from '../../Tweener'

export class RealSound extends AbstractVolumeable implements Sound {
	
	private adjusters: Array<SoundAdjuster> = null
	private played: boolean = false
	
	constructor(
		tweener: Tweener,
		private owner: RealSoundOwner,
		public readonly name: string,
		public source: AudioSource,
		private clip: AudioClip,
		settings?: SoundSettings
	) {
		super(tweener)
		
		this.source.node.once(AudioSource.EventType.STARTED, this.onStart, this)
		this.source.node.once(AudioSource.EventType.ENDED, this.onEnd, this)
		this.source.loop = false
		
		if (settings !== undefined) {
			if (settings.loop) {
				this.source.loop = settings.loop
			}
			if (settings.smooth) {
				this.addAdjuster(new FadeSoundAdjuster(this, settings.smooth))
			}
			if (settings.jumps) {
				this.source.loop = true
				this.addAdjuster(new JumpsSoundAdjuster(this, settings.jumps))
			}
		}
	}
	
	public get duration(): number {
		return 1000 * this.clip.getDuration()
	}
	
	public play(from?: number) {
		if (this.source && (!this.played || from !== undefined)) {
			this.played = true
			
			if (!this.source.clip) {
				this.source.clip = this.clip
			}
			this.source.play()
			
			if (this.adjusters) {
				for (const adjuster of this.adjusters) {
					adjuster.handlePlay()
				}
			}
			
			if (from !== undefined) {
				this.source.currentTime = from / 1000
			}
		}
	}
	
	public pause() {
		if (this.played) {
			this.played = false
			let wait = false
			if (this.adjusters) {
				for (const adjuster of this.adjusters) {
					wait = adjuster.handlePause() || wait
				}
			}
			if (!wait) {
				this.doPause()
			}
		}
	}
	
	public stop() {
		if (this.played) {
			this.played = false
			let wait = false
			if (this.adjusters) {
				for (const adjuster of this.adjusters) {
					wait = adjuster.handleStop() || wait
				}
			}
			if (!wait) {
				this.doStop()
			}
		}
	}
	
	public doPause() {
		this.source.pause()
	}
	
	public doStop() {
		this.source.stop()
		this.onEnd()
	}
	
	public updateVolume() {
		if (this.source) {
			this.source.volume = this.owner.getVolume() * this.getVolume()
		}
	}
	
	private onStart() {
		if (this.source) {
			if (this.adjusters) {
				for (const adjuster of this.adjusters) {
					adjuster.handleStart()
				}
			}
			this.updateVolume()
		}
	}
	
	private onEnd() {
		if (this.source) {
			this.played = false
			
			this.source.node.targetOff(AudioSource.EventType.STARTED)
			this.source.node.targetOff(AudioSource.EventType.ENDED)
			
			if (this.adjusters) {
				for (const adjuster of this.adjusters) {
					adjuster.handleEnd()
				}
				this.adjusters.length = 0
				this.adjusters = null
			}
			
			this.owner.releaseSound(this)
			
			this.source.clip = null
			this.source = null
			this.clip = null
			
			this.stop()
		}
	}
	
	private addAdjuster(adjuster: SoundAdjuster) {
		if (!this.adjusters) this.adjusters = []
		this.adjusters.push(adjuster)
	}
}