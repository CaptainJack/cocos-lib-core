import {_decorator, assetManager, Material, Sprite, UITransform, Vec2} from 'cc'

@_decorator.ccclass('RoundRectSprite')
@_decorator.menu('lib/render/RoundRectSprite')
@_decorator.disallowMultiple(true)
@_decorator.executeInEditMode(true)
export class RoundRectSprite extends Sprite {
	@_decorator.property
	private _radius: number = 10
	
	@_decorator.property
	public get radius(): number {
		return this._radius
	}
	
	public set radius(value: number) {
		this._radius = value
		this.updateMaterialProperties()
	}
	
	public onLoad() {
		this.customMaterial = assetManager.assets.get('e16f795b-e7a8-4dd6-a07f-cb80b486bd91') as Material
	}
	
	public markForUpdateRenderData(enable?: boolean) {
		const frame = this.spriteFrame
		if (frame) frame.packable = false
		this.updateMaterialProperties()
		super.markForUpdateRenderData()
	}
	
	private updateMaterialProperties() {
		const size = this.node.getComponent(UITransform).contentSize
		
		const material = this.getMaterial(0)
		material.setProperty('size', new Vec2(size.width, size.height))
		material.setProperty('radius', this._radius)
	}
}

