import {_decorator, assetManager, Material, Sprite} from 'cc'

@_decorator.ccclass('CircleSprite')
@_decorator.menu('lib/render/CircleSprite')
@_decorator.disallowMultiple(true)
@_decorator.executeInEditMode(true)
export class CircleSprite extends Sprite {
	public onLoad() {
		this.customMaterial = assetManager.assets.get('1f1dca05-8255-4d56-af1d-51e858e868ad') as Material
	}
	
	public markForUpdateRenderData(enable?: boolean) {
		const frame = this.spriteFrame
		if (frame) frame.packable = false
		super.markForUpdateRenderData()
	}
}

