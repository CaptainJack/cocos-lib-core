import {_decorator, ccenum, NodeEventType, Sprite, UITransform} from 'cc'
import {NormalizedComponent} from '../../../../main/lib-main/components/NormalizedComponent'

export enum FilledScaledSpriteFix {
	VERTICAL,
	HORIZONTAL
}

ccenum(FilledScaledSpriteFix)

@_decorator.ccclass('FilledScaledSprite')
@_decorator.menu('lib/layout/FilledScaledSprite')
@_decorator.disallowMultiple(true)
@_decorator.requireComponent(Sprite)
@_decorator.requireComponent(UITransform)
@_decorator.executeInEditMode(true)
export class FilledScaledSprite extends NormalizedComponent {
	
	@_decorator.type(FilledScaledSpriteFix)
	private _fix = FilledScaledSpriteFix.VERTICAL
	
	@_decorator.type(FilledScaledSpriteFix)
	public get fix(): FilledScaledSpriteFix {
		return this._fix
	}
	
	public set fix(value: FilledScaledSpriteFix) {
		this._fix = value
		this.fill()
	}
	
	protected onLoad() {
		super.onLoad()
		
		const sprite = this.getComponent(Sprite)
		
		sprite.sizeMode = Sprite.SizeMode.CUSTOM
		sprite.type = Sprite.Type.SLICED
		
		this.node.parent.on(NodeEventType.SIZE_CHANGED, this.fill, this)
		
		this.fill()
	}
	
	private fill() {
		const parentSize = this.node.parent.getComponent(UITransform).contentSize
		const spriteSize = this.getComponent(Sprite).spriteFrame.originalSize
		const transform = this.getComponent(UITransform)
		
		let scale: number = 1
		
		switch (this._fix) {
			case FilledScaledSpriteFix.VERTICAL:
				scale = parentSize.height / spriteSize.height
				transform.setContentSize(parentSize.width / scale, spriteSize.height)
				break
			case FilledScaledSpriteFix.HORIZONTAL:
				scale = parentSize.width / spriteSize.width
				transform.setContentSize(spriteSize.width, parentSize.height / scale)
				break
		}
		
		this.node.setScale(scale, scale)
		
	}
}
