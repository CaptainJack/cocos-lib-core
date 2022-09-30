import {_decorator, ccenum, Node, Size, UITransform, Widget} from 'cc'
import {NormalizedComponent} from '../../../../main/lib-main/components/NormalizedComponent'

export enum FillingType {
	INSIDE,
	OUTSIDE,
	WIDTH,
	HEIGHT
}

ccenum(FillingType)

@_decorator.ccclass('FillingScaleNode')
@_decorator.menu('lib/layout/FillingScaleNode')
@_decorator.executeInEditMode(true)
export class FillingScaleLayout extends NormalizedComponent {
	@_decorator.property({type: FillingType, visible: true})
	private _type: FillingType = FillingType.INSIDE
	
	protected onEnable() {
		this.node.parent.on(Node.EventType.SIZE_CHANGED, this.fill, this)
		this.node.on(Node.EventType.SIZE_CHANGED, this.fill, this)
	}
	
	protected onDisable() {
		this.node.parent.off(Node.EventType.SIZE_CHANGED, this.fill, this)
		this.node.off(Node.EventType.SIZE_CHANGED, this.fill, this)
	}
	
	protected start() {
		this.fill()
	}
	
	private fill() {
		const parentSize = this.node.parent.getComponent(UITransform).contentSize
		const selfSize = this.node.getComponent(UITransform).contentSize
		
		if (parentSize.equals(selfSize)) {
			this.setScale(1)
		}
		else {
			switch (this._type) {
				case FillingType.INSIDE:
					this.fillInside(parentSize, selfSize)
					break
				case FillingType.OUTSIDE:
					this.fillOutside(parentSize, selfSize)
					break
				case FillingType.WIDTH:
					this.fillWidth(parentSize, selfSize)
					break
				case FillingType.HEIGHT:
					this.fillHeight(parentSize, selfSize)
					break
			}
		}
	}
	
	private fillInside(parentSize: Readonly<Size>, selfSize: Readonly<Size>) {
		if (this.isLandscapeRation(parentSize, selfSize)) {
			this.fillHeight(parentSize, selfSize)
		}
		else {
			this.fillWidth(parentSize, selfSize)
		}
	}
	
	private fillOutside(parentSize: Readonly<Size>, selfSize: Readonly<Size>) {
		if (this.isLandscapeRation(parentSize, selfSize)) {
			this.fillWidth(parentSize, selfSize)
		}
		else {
			this.fillHeight(parentSize, selfSize)
		}
	}
	
	private fillWidth(parentSize: Readonly<Size>, selfSize: Readonly<Size>) {
		if (parentSize.width === selfSize.width) {
			this.setScale(1)
		}
		else {
			this.setScale(parentSize.width / selfSize.width)
		}
	}
	
	private fillHeight(parentSize: Readonly<Size>, selfSize: Readonly<Size>) {
		if (parentSize.height === selfSize.height) {
			this.setScale(1)
		}
		else {
			this.setScale(parentSize.height / selfSize.height)
		}
	}
	
	private setScale(value: number) {
		this.node.setScale(value, value)
		const widget = this.node.getComponent(Widget)
		widget && widget.updateAlignment()
	}
	
	private isLandscapeRation(parentSize: Readonly<Size>, selfSize: Readonly<Size>): boolean {
		const parentRatio = parentSize.width / parentSize.height
		const selfRatio = selfSize.width / selfSize.height
		return parentRatio > selfRatio
	}
}
