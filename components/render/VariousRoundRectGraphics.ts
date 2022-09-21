import {_decorator, Graphics, NodeEventType, UITransform} from 'cc'

@_decorator.ccclass('VariousRoundRectGraphics')
@_decorator.menu('lib/render/VariousRoundRectGraphics')
@_decorator.disallowMultiple(true)
export class VariousRoundRectGraphics extends Graphics {
	@_decorator.property
	private _leftTop: number = 0
	
	@_decorator.property
	private _leftBottom: number = 0
	
	@_decorator.property
	private _rightTop: number = 0
	
	@_decorator.property
	private _rightBottom: number = 0
	
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
	
	@_decorator.property({group: 'corners'})
	public get leftTop(): number {
		return this._leftTop
	}
	
	public set leftTop(value: number) {
		if (this._leftTop != value) {
			this._leftTop = value
			this.draw()
		}
	}
	
	@_decorator.property({group: 'corners'})
	public get leftBottom(): number {
		return this._leftBottom
	}
	
	public set leftBottom(value: number) {
		if (this._leftBottom != value) {
			this._leftBottom = value
			this.draw()
		}
	}
	
	@_decorator.property({group: 'corners'})
	public get rightTop(): number {
		return this._rightTop
	}
	
	public set rightTop(value: number) {
		if (this._rightTop != value) {
			this._rightTop = value
			this.draw()
		}
	}
	
	@_decorator.property({group: 'corners'})
	public get rightBottom(): number {
		return this._rightBottom
	}
	
	public set rightBottom(value: number) {
		if (this._rightBottom != value) {
			this._rightBottom = value
			this.draw()
		}
	}
	
	public onLoad() {
		super.onLoad()
		
		this.draw()
		
		this.node.on(NodeEventType.SIZE_CHANGED, this.draw, this)
	}
	
	public draw() {
		const K = 1 - 0.5522847493
		
		const t = this.getComponent(UITransform)
		const x = -t.anchorX * t.width
		const y = -t.anchorY * t.height
		const w = t.width
		const h = t.height
		
		const rx_lt = Math.min(this._leftTop, Math.abs(w)) * Math.sign(w)
		const ry_lt = Math.min(this._leftTop, Math.abs(h)) * Math.sign(h)
		
		const rx_lb = Math.min(this._leftBottom, Math.abs(w)) * Math.sign(w)
		const ry_lb = Math.min(this._leftBottom, Math.abs(h)) * Math.sign(h)
		
		const rx_rt = Math.min(this._rightTop, Math.abs(w)) * Math.sign(w)
		const ry_rt = Math.min(this._rightTop, Math.abs(h)) * Math.sign(h)
		
		const rx_rb = Math.min(this._rightBottom, Math.abs(w)) * Math.sign(w)
		const ry_rb = Math.min(this._rightBottom, Math.abs(h)) * Math.sign(h)
		
		this.clear()
		
		this.moveTo(x, y + ry_lb)
		this.lineTo(x, y + h - ry_lt)
		this.bezierCurveTo(x, y + h - ry_lt * K, x + rx_lt * K, y + h, x + rx_lt, y + h)
		this.lineTo(x + w - rx_rt, y + h)
		this.bezierCurveTo(x + w - rx_rt * K, y + h, x + w, y + h - ry_rt * K, x + w, y + h - ry_rt)
		this.lineTo(x + w, y + ry_rb)
		this.bezierCurveTo(x + w, y + ry_rb * K, x + w - rx_rb * K, y, x + w - rx_rb, y)
		this.lineTo(x + rx_lb, y)
		this.bezierCurveTo(x + rx_lb * K, y, x, y + ry_lb * K, x, y + ry_lb)
		this.close()
		
		if (this._useFill) {
			this.fill()
		}
		if (this._useStroke) {
			this.stroke()
		}
	}
}
