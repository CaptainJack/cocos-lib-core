import {AudioClip, AudioSource, Node} from 'cc'
import {AbstractVolumeable} from './AbstractVolumeable'
import {DummySound} from './DummySound'
import {RealSound} from './RealSound'
import {RealSoundOwner} from './RealSoundOwner'
import {Tweener} from '../../Tweener'
import {Audio, Sound, SoundSettings} from '../../Audio'
import {isEmpty, isString} from '../../../capjack/tool/lang/_utils'
import {_assets} from '../../../tools/_assets'
import {ArrayQueue} from '../../../capjack/tool/utils/collections/ArrayQueue'
import {Cancelable} from '../../../capjack/tool/utils/Cancelable'

export class AudioImpl extends AbstractVolumeable implements Audio, RealSoundOwner {
	
	private _node: Node
	private _nodes = new ArrayQueue<Node>()
	private _shotSource: AudioSource
	private _sounds = new Set<RealSound>()
	private _volumeHandlers: Set<(volume: number) => void> = new Set()
	
	constructor(
		node: Node,
		tweener: Tweener
	) {
		super(tweener)
		this._node = node
		this._shotSource = this.provideSource()
	}
	
	public getDuration(name): number {
		const clip = this.extractClip(name)
		return clip ? (1000 * clip.getDuration()) : 0
	}
	
	public prepare(clip: string | AudioClip, settings?: SoundSettings): Sound {
		let name : string
		if (isString(clip)) {
			name = clip
			clip  = this.extractClip(name)
			if (!clip) return DummySound.INSTANCE
		}
		else {
			name = clip.name
		}
		
		const source = this.provideSource()
		const sound = new RealSound(this.tweener, this, name, source, clip, settings)
		this._sounds.add(sound)
		return sound
	}
	
	public play(clip: string | AudioClip, settings?: SoundSettings): Sound {
		const sound = this.prepare(clip, settings)
		sound.play()
		return sound
	}
	
	public shot(clip: string | AudioClip) {
		if (isEmpty(clip)) return
		
		if (isString(clip)) {
			clip  = this.extractClip(clip)
		}
		
		if (clip) {
			this._shotSource.playOneShot(clip)
		}
	}
	
	public releaseSound(sound: RealSound) {
		this._sounds.delete(sound)
		this.releaseSource(sound.source)
	}
	
	public stop() {
		for (const sound of this._sounds) {
			sound.stop()
		}
		super.stop()
		
		while (true) {
			const node = this._nodes.poll()
			if (!node) break
			node.destroy()
		}
		this._nodes.clear()
		this._nodes = null
		this._node = null
		this._shotSource = null
		
		this._sounds = null
	}
	
	public onVolume(handler: (volume: number) => void): Cancelable {
		this._volumeHandlers.add(handler)
		return Cancelable.wrap(() => this._volumeHandlers.delete(handler))
	}
	
	protected updateVolume() {
		const volume = this.getVolume()
		this._shotSource.volume = volume
		
		for (const sound of this._sounds) {
			sound.updateVolume()
		}
		for (const handler of this._volumeHandlers) {
			handler(volume)
		}
	}
	
	protected resolvePath(name: string): string {
		return name
	}
	
	private extractClip(name: string): AudioClip | null {
		if (isEmpty(name)) return null
		const path = this.resolvePath(name)
		return _assets.exists(path) ? _assets.get(path, AudioClip) : null
	}
	
	private provideSource(): AudioSource {
		let node = this._nodes.poll()
		if (!node) {
			node = new Node()
			this._node.addChild(node)
		}
		
		return node.addComponent(AudioSource)
	}
	
	private releaseSource(source: AudioSource) {
		if (this._nodes) {
			this._nodes.add(source.node)
			source.destroy()
		}
		else {
			source.node.destroy()
		}
	}
}
