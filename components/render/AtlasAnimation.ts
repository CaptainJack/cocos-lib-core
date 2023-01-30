import {NormalizedComponent} from '../../../../main/lib-main/components/NormalizedComponent'
import {_decorator, Sprite, SpriteFrame} from 'cc'

@_decorator.ccclass('AtlasAnimation')
@_decorator.menu('lib/render/AtlasAnimation')
@_decorator.disallowMultiple(true)
@_decorator.requireComponent(Sprite)
export class AtlasAnimation extends NormalizedComponent {
	private sprite: Sprite
	private frames: Array<SpriteFrame>
	private frame: number = 0
	private played: boolean = false
	private loop: boolean
	
	@_decorator.property
	private latent: boolean = true
	
	public play(loop: boolean = false) {
		this.played = true
		this.loop = loop
		
		if (this.latent) this.node.active = true
		
		this.updateSpriteFrame()
	}
	
	public stop() {
		this.played = false
		this.frame = 0
		this.updateSpriteFrame()
		
		if (this.latent) this.node.active = false
	}
	
	protected onLoad() {
		super.onLoad()
		
		this.sprite = this.getComponent(Sprite)
		this.frames = this.sprite.spriteAtlas.getSpriteFrames()
		
		if (!this.played && this.latent) {
			this.node.active = false
		}
	}
	
	protected update() {
		if (this.played) {
			this.updateSpriteFrame()
			++this.frame
			if (this.frame == this.frames.length) {
				if (this.loop) {
					this.frame = 0
				}
				else {
					this.stop()
				}
			}
		}
	}
	
	private updateSpriteFrame() {
		this.sprite.spriteFrame = this.frames[this.frame]
	}
}