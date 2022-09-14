import {_decorator, Graphics, NodeEventType, UITransform} from 'cc'

@_decorator.ccclass('EllipseGraphics')
@_decorator.menu('lib/render/EllipseGraphics')
@_decorator.disallowMultiple(true)
export class EllipseGraphics extends Graphics {
	@_decorator.property
	private _useFill: boolean = true
	
	@_decorator.property
	private _useStroke: boolean = false
	
	@_decorator.property
	public get useFill(): boolean {
		return this._useFill
	}
	
	public set useFill(value: boolean) {
		if (this._useFill != value) {
			this._useFill = value
			this.draw()
		}
	}
	
	@_decorator.property
	public get useStroke(): boolean {
		return this._useStroke
	}
	
	public set useStroke(value: boolean) {
		if (this._useStroke != value) {
			this._useStroke = value
			this.draw()
		}
	}
	
	
	public onLoad() {
		super.onLoad()
		
		this.draw()
		
		this.node.on(NodeEventType.SIZE_CHANGED, this.draw, this)
	}
	
	public draw() {
		const t = this.getComponent(UITransform)
		const w = t.width / 2
		const h = t.height / 2
		
		this.clear()
		this.ellipse((0.5 - t.anchorX) * t.width,  (0.5 - t.anchorY) * t.height, w, h)
		
		if (this._useFill) {
			this.fill()
		}
		if (this._useStroke) {
			this.stroke()
		}
	}
}
