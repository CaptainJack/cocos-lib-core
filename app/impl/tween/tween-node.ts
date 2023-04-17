import {tween_common as _tc} from './tween-common'
import {NodeTweenParameters, TweenCalculator, TweenParameter, TweenParameterOpacity, TweenPosition} from '../../Tweener'
import {Component, Node, UIOpacity, UIRenderer} from 'cc'
import {IllegalArgumentException} from '../../../capjack/tool/lang/exceptions/IllegalArgumentException'
import {EMPTY_FUNCTION, isNullable, isNumber} from '../../../capjack/tool/lang/_utils'
import {BezierCurve} from '../../../tools/BezierCurve'

export namespace tween_node {
	
	export interface NodeMotion extends _tc.Cloneable {
		start(target: Node): void
		
		move(k: number): void
		
		complete(): void
	}
	
	export function factoryMotions(parameters: NodeTweenParameters): Array<NodeMotion> {
		
		const motions: Array<NodeMotion> = []
		
		if (parameters.x !== undefined) motions.push(new Motion_X(parameters.x, parameters.update))
		if (parameters.y !== undefined) motions.push(new Motion_Y(parameters.y, parameters.update))
		if (parameters.opacity !== undefined) motions.push(new Motion_Opacity(parameters.opacity, parameters.update))
		if (parameters.scale !== undefined) motions.push(new Motion_Scale(parameters.scale, parameters.update))
		if (parameters.scaleX !== undefined) motions.push(new Motion_ScaleX(parameters.scaleX, parameters.update))
		if (parameters.scaleY !== undefined) motions.push(new Motion_ScaleY(parameters.scaleY, parameters.update))
		if (parameters.width !== undefined) motions.push(new Motion_Width(parameters.width, parameters.update))
		if (parameters.height !== undefined) motions.push(new Motion_Height(parameters.height, parameters.update))
		if (parameters.position !== undefined) {
			if (parameters.position instanceof BezierCurve) motions.push(new Motion_PositionBezierCurve(parameters.position, parameters.update))
			else motions.push(new Motion_Position(parameters.position, parameters.update))
		}
		
		return motions
	}
	
	abstract class SingleNumberMotion implements NodeMotion {
		protected target: Node
		protected update: (k: number) => void = EMPTY_FUNCTION
		protected to: number
		protected from: number = null
		protected delta: number
		private calculate: TweenCalculator<number> = TweenCalculator.direct
		
		constructor(protected parameter: TweenParameter<number>, update: (k: number) => void) {
			if (!isNullable(update)) {
				this.update = update
			}
			
			if (isNumber(parameter)) {
				this.to = parameter
			}
			else {
				this.to = parameter.to
				this.from = parameter.from
				if (!isNullable(parameter.calc)) this.calculate = parameter.calc
			}
		}
		
		public start(target: Node) {
			this.target = target
			if (isNullable(this.from)) {
				this.from = this.defineFrom()
				this.delta = this.to - this.from
			}
			else {
				this.delta = this.to - this.from
				this.move(0)
			}
		}
		
		public move(k: number) {
			this.set(this.calculate(k, this.from, this.to, this.delta))
			this.update(k)
		}
		
		public complete() {
			this.move(1)
			
			this.target = null
			this.from = null
			this.delta = null
			this.to = null
			this.parameter = null
			this.calculate = null
			this.update = null
		}
		
		public abstract clone(): SingleNumberMotion
		
		protected abstract defineFrom(): number
		
		protected abstract set(value: number)
	}
	
	class Motion_X extends SingleNumberMotion {
		public clone(): Motion_X {
			return new Motion_X(this.parameter, this.update)
		}
		
		protected defineFrom(): number {
			return this.target.position.x
		}
		
		protected set(value: number) {
			return this.target.setPosition(value, this.target.position.y)
		}
	}
	
	class Motion_Y extends SingleNumberMotion {
		public clone(): Motion_Y {
			return new Motion_Y(this.parameter, this.update)
		}
		
		protected defineFrom(): number {
			return this.target.position.y
		}
		
		protected set(value: number) {
			return this.target.setPosition(this.target.position.x, value)
		}
	}
	
	class Motion_Scale extends SingleNumberMotion {
		public clone(): Motion_Scale {
			return new Motion_Scale(this.parameter, this.update)
		}
		
		protected defineFrom(): number {
			return this.target.scale.x
		}
		
		protected set(value: number) {
			this.target.setScale(value, value)
		}
	}
	
	class Motion_ScaleX extends SingleNumberMotion {
		public clone(): Motion_ScaleX {
			return new Motion_ScaleX(this.parameter, this.update)
		}
		
		protected defineFrom(): number {
			return this.target.scale.x
		}
		
		protected set(value: number) {
			this.target.setScale(value, this.target.scale.y)
		}
	}
	
	class Motion_ScaleY extends SingleNumberMotion {
		public clone(): Motion_ScaleY {
			return new Motion_ScaleY(this.parameter, this.update)
		}
		
		protected defineFrom(): number {
			return this.target.scale.y
		}
		
		protected set(value: number) {
			this.target.setScale(this.target.scale.x, value)
		}
	}
	
	class Motion_Width extends SingleNumberMotion {
		public clone(): Motion_Width {
			return new Motion_Width(this.parameter, this.update)
		}
		
		protected defineFrom(): number {
			return this.target.getWidth()
		}
		
		protected set(value: number) {
			this.target.setWidth(value)
		}
	}
	
	class Motion_Height extends SingleNumberMotion {
		public clone(): Motion_Height {
			return new Motion_Height(this.parameter, this.update)
		}
		
		protected defineFrom(): number {
			return this.target.getHeight()
		}
		
		protected set(value: number) {
			this.target.setHeight(value)
		}
	}
	
	class Motion_Position implements NodeMotion {
		protected update: (k: number) => void = EMPTY_FUNCTION
		private target: Node
		private to: TweenPosition
		private from: TweenPosition = null
		private delta: TweenPosition
		private calculate: TweenCalculator<TweenPosition> = TweenCalculator.directPosition
		
		constructor(private parameter: TweenParameter<TweenPosition>, update: (k: number) => void) {
			if (!isNullable(update)) {
				this.update = update
			}
			
			if (isNullable(parameter['to'])) {
				const p = parameter as TweenPosition
				this.to = {x: p.x, y: p.y}
			}
			else {
				const p = parameter as {from: TweenPosition, to: TweenPosition}
				this.to = {x: p.to.x, y: p.to.y}
				if (p.from) {
					this.from = {x: p.from.x, y: p.from.y}
				}
			}
			
			if (!isNullable(parameter['calc'])) {
				this.calculate = parameter['calc']
			}
		}
		
		public start(target: Node) {
			this.target = target
			if (this.from === null) {
				this.from = {x: target.position.x, y: target.position.y}
				this.delta = {x: this.to.x - this.from.x, y: this.to.y - this.from.y}
			}
			else {
				this.delta = {x: this.to.x - this.from.x, y: this.to.y - this.from.y}
				
				this.move(0)
			}
			
		}
		
		public move(k: number) {
			const current = this.calculate(k, this.from, this.to, this.delta)
			this.target.setPosition(current.x, current.y)
			this.update(k)
		}
		
		public complete() {
			this.move(1)
			
			this.target = null
			this.from = null
			this.delta = null
			this.to = null
			this.parameter = null
		}
		
		public clone(): any {
			return new Motion_Position(this.parameter, this.update)
		}
	}
	
	class Motion_PositionBezierCurve extends SingleNumberMotion {
		
		constructor(private curve: BezierCurve, update: (k: number) => void) {
			super(1, update)
		}
		
		public clone(): Motion_PositionBezierCurve {
			return new Motion_PositionBezierCurve(this.curve, this.update)
		}
		
		protected defineFrom(): number {
			return 0
		}
		
		protected set(value: number) {
			this.target.setPosition(this.curve.x(value), this.curve.y(value))
		}
		
	}
	
	class Motion_Opacity extends SingleNumberMotion {
		private behavior: Motion_Opacity_Behavior
		private active: boolean
		
		constructor(protected parameter: TweenParameterOpacity<number>, update: (k: number) => void) {
			super(parameter, update)
			this.active = isNumber(parameter) ? false : !!parameter.active
		}
		
		public start(target: Node) {
			if (!target.components) {
				this.behavior = new Motion_Opacity_Behavior_Dummy()
			}
			else {
				let component: UIOpacity | UIRenderer = target.getComponent(UIOpacity)
				if (component) {
					this.behavior = new Motion_Opacity_Behavior_UIOpacity(component)
				}
				else {
					component = target.getComponent(UIRenderer)
					if (component) {
						this.behavior = new Motion_Opacity_Behavior_UIRenderer(component)
					}
					else {
						throw new IllegalArgumentException('UIOpacity or UIRenderer component required')
					}
				}
				if (this.active) {
					target.active = true
				}
			}
			super.start(target)
		}
		
		public clone(): Motion_Opacity {
			return new Motion_Opacity(this.parameter, this.update)
		}
		
		public move(k: number) {
			super.move(k)
			if (this.active && k == 1 && this.to == 0) {
				this.target.active = false
			}
		}
		
		public complete() {
			super.complete()
			this.behavior.destroy()
			this.behavior = null
		}
		
		protected defineFrom(): number {
			return this.behavior.defineFrom() / 255
		}
		
		protected set(value: number) {
			this.behavior.set(value * 255)
		}
	}
	
	interface Motion_Opacity_Behavior {
		defineFrom(): number
		
		set(value: number)
		
		destroy()
	}
	
	class Motion_Opacity_Behavior_Dummy implements Motion_Opacity_Behavior {
		public defineFrom(): number {
			return 0
		}
		
		public destroy() {}
		
		public set(value: number) {}
	}
	
	abstract class Motion_Opacity_Behavior_Component<C extends Component> implements Motion_Opacity_Behavior {
		constructor(protected component: C) {}
		
		abstract defineFrom(): number
		
		abstract set(value: number)
		
		public destroy() {
			this.component = null
		}
	}
	
	class Motion_Opacity_Behavior_UIOpacity extends Motion_Opacity_Behavior_Component<UIOpacity> {
		public defineFrom(): number {
			return this.component.opacity
		}
		
		public set(value: number) {
			if (this.component.isValid) {
				this.component.opacity = value
			}
		}
	}
	
	class Motion_Opacity_Behavior_UIRenderer extends Motion_Opacity_Behavior_Component<UIRenderer> {
		public defineFrom(): number {
			return this.component.color.a
		}
		
		public set(value: number) {
			if (this.component.isValid) {
				const color = this.component.color.clone()
				color.a = value
				this.component.color = color
			}
		}
	}
}