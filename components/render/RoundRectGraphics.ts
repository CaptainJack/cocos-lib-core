import {_decorator, Graphics, NodeEventType} from 'cc'
import {RoundRectComponent} from './RoundRectComponent'

@_decorator.ccclass('RoundRectGraphics')
@_decorator.menu('lib/render/RoundRectGraphics')
@_decorator.disallowMultiple(true)
export class RoundRectGraphics extends Graphics implements RoundRectComponent {
	@_decorator.property
	private _radius: number = -1
	
	@_decorator.property
	private _leftTop: boolean = true
	
	@_decorator.property
	private _leftBottom: boolean = true
	
	@_decorator.property
	private _rightTop: boolean = true
	
	@_decorator.property
	private _rightBottom: boolean = true
	
	@_decorator.property
	private _useFill: boolean = true
	
	@_decorator.property
	private _useStroke: boolean = false
	
	@_decorator.property
	public get radius(): number {
		return this._radius
	}
	
	@_decorator.property
	public get useFill(): boolean {
		return this._useFill
	}
	
	public set useFill(value: boolean) {
		if (this._useFill != value ) {
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
	
	public set radius(value: number) {
		if (this._radius != value) {
			this._radius = value
			this.draw()
		}
	}
	
	@_decorator.property({group: 'corners'})
	public get leftTop(): boolean {
		return this._leftTop
	}
	
	public set leftTop(value: boolean) {
		if (this._leftTop != value) {
			this._leftTop = value
			this.draw()
		}
	}
	
	@_decorator.property({group: 'corners'})
	public get leftBottom(): boolean {
		return this._leftBottom
	}
	
	public set leftBottom(value: boolean) {
		if (this._leftBottom != value) {
			this._leftBottom = value
			this.draw()
		}
	}
	
	@_decorator.property({group: 'corners'})
	public get rightTop(): boolean {
		return this._rightTop
	}
	
	public set rightTop(value: boolean) {
		if (this._rightTop != value) {
			this._rightTop = value
			this.draw()
		}
	}
	
	@_decorator.property({group: 'corners'})
	public get rightBottom(): boolean {
		return this._rightBottom
	}
	
	public set rightBottom(value: boolean) {
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
		RoundRectComponent.draw(this, this)
		
		if (this._useFill) {
			this.fill()
		}
		if (this._useStroke) {
			this.stroke()
		}
	}
}
