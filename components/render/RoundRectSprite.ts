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
		this.updateMaterial()
	}
	
	public onLoad() {
		super.onLoad()
		this.customMaterial = assetManager.assets.find(a => a.name === 'RoundRectSprite' && a instanceof Material) as Material
	}
	
	public markForUpdateRenderData(enable?: boolean) {
		this.updateMaterialProperties()
		super.markForUpdateRenderData(enable)
	}
	
	protected updateMaterial() {
		super.updateMaterial()
		this.updateMaterialProperties()
	}
	
	private updateMaterialProperties() {
		const frame = this.spriteFrame
		const size = this.node.getComponent(UITransform).contentSize
		const material = this.getMaterialInstance(0)
		
		if (frame) frame.packable = false
		
		material.setProperty('size', new Vec2(size.width, size.height))
		material.setProperty('radius', this._radius)
	}
}

