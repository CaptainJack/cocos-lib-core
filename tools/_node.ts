import {Class} from '../capjack/tool/lang/_types'
import {Component, Node, Renderable2D, UIOpacity, UITransform} from 'cc'
import {require} from '../capjack/tool/lang/_utils'
import {IllegalArgumentException} from '../capjack/tool/lang/exceptions/IllegalArgumentException'

declare module 'cc' {
	interface Node {
		getChildComponent<T extends Component>(path: string, type: Class<T>): T
		
		setOpacity(percent: number)
		
		setScaleFully(percent: number)
		
		setWidth(value: number)
		
		getWidth(): number
		
		setHeight(value: number)
		
		getHeight(): number
		
		setX(value: number)
		
		setY(value: number)
		
		setScaleX(percent: number)
		
		setScaleY(percent: number)
	}
	
	interface Component {
		getChildComponent<T extends Component>(path: string, type: Class<T>): T
		
		getChild(path: string): Node
	}
}

Node.prototype.getChildComponent = function <T extends Component>(path: string, type: Class<T>): T {
	const node = this.getChildByPath(path)
	return node ? node.getComponent(type) : null
}

Component.prototype.getChildComponent = function <T extends Component>(path: string, type: Class<T>): T {
	return this.node.getChildComponent(path, type)
}

Component.prototype.getChild = function(path: string): Node {
	return this.node.getChildByPath(path)
}

Node.prototype.setOpacity = function (percent: number) {
	require(percent >= 0 && percent <= 1)
	
	const opacity = 255 * percent
	const opacityComponent: UIOpacity = this.getComponent(UIOpacity)
	
	if (opacityComponent) {
		opacityComponent.opacity = opacity
	}
	else {
		const renderableComponent: Renderable2D = this.getComponent(Renderable2D)
		if (renderableComponent) {
			const color = renderableComponent.color.clone()
			color.a = opacity
			renderableComponent.color = color
		}
		else {
			throw new IllegalArgumentException('UIOpacity or Renderable2D component required')
		}
	}
}

Node.prototype.setScaleFully = function (value: number) {
	this.setScale(value, value)
}

Node.prototype.setWidth = function (value: number) {
	this.getComponent(UITransform).width = value
}

Node.prototype.setHeight = function (value: number) {
	this.getComponent(UITransform).height = value
}

Node.prototype.getWidth = function (): number {
	return this.getComponent(UITransform).width
}

Node.prototype.getHeight = function (): number {
	return this.getComponent(UITransform).height
}

Node.prototype.setX = function (value: number) {
	this.setPosition(value, this.position.y)
}

Node.prototype.setY = function (value: number) {
	this.setPosition(this.position.x, value)
}

Node.prototype.setScaleX = function (percent: number) {
	this.setScale(percent, this.scale.y)
}

Node.prototype.setScaleY = function (percent: number) {
	this.setScale(this.scale.x, percent)
}