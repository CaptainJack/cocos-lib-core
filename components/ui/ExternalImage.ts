import {NormalizedComponent} from '../../../../main/lib-main/components/NormalizedComponent'
import {_decorator, CCString, Sprite, SpriteFrame} from 'cc'
import {EDITOR} from 'cc/env'

@_decorator.ccclass('ExternalImage')
@_decorator.menu('lib/ui/ExternalImage')
@_decorator.disallowMultiple(true)
@_decorator.requireComponent(Sprite)
export class ExternalImage extends NormalizedComponent {
	@_decorator.property
	private _path: string = ''
	
	private _default: SpriteFrame
	
	@_decorator.property
	public get path(): string {
		return this._path
	}
	
	public set path(value: string) {
		if (this._path != value) {
			this._path = value
			this.setupSprite()
		}
	}
	
	protected onLoad() {
		super.onLoad()
		this._default = this.getComponent(Sprite).spriteFrame
		this.setupSprite()
	}
	
	private setupSprite() {
		if (EDITOR) return
		
		const sprite = this.getComponent(Sprite)
		sprite.spriteFrame = this._default
		if (this._path) {
			app.assets.loadExternalImage(this._path, sprite)
		}
	}
}