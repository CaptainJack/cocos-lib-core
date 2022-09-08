import {_decorator, Graphics, Mask, NodeEventType} from 'cc'
import {RoundRectComponent} from './RoundRectComponent'

@_decorator.ccclass('RoundRectMask')
@_decorator.menu('lib/render/RoundRectMask')
@_decorator.disallowMultiple(true)
export class RoundRectMask extends Mask implements RoundRectComponent {
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
	public get radius(): number {
		return this._radius
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
		
		this.type = Mask.Type.GRAPHICS_STENCIL
		this.draw()
		
		this.node.on(NodeEventType.SIZE_CHANGED, this.draw, this)
	}
	
	private draw() {
		RoundRectComponent.draw(this.subComp as Graphics, this)
	}
}