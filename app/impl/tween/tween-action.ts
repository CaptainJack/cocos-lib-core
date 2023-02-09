import {Node} from 'cc'
import {tween_node as _tn} from './tween-node'
import {tween_common as _tc} from './tween-common'
import {Long} from '../../../capjack/tool/lang/Long'
import {TweenEasing} from '../../Tweener'

export namespace tween_action {
	
	export interface Action extends _tc.Cloneable {
		update(time): boolean
		
		start(): void
	}
	
	export class CallAction implements Action {
		constructor(private fn: () => void) {}
		
		public update(time): boolean {
			this.fn()
			this.fn = null
			return true
		}
		
		public start(): void {}
		
		public clone(): CallAction {
			return new CallAction(this.fn)
		}
	}
	
	export class DelayAction implements Action {
		constructor(private duration: number, private fn?: () => void) {
		}
		
		public update(time): boolean {
			this.duration -= time
			const b = this.duration <= 0
			if (b && this.fn) this.fn()
			return b
		}
		
		public start(): void {}
		
		public clone(): DelayAction {
			return new DelayAction(this.duration)
		}
	}
	
	export class RepeatAction implements Action {
		private duration: number
		private iteration: number = 0
		
		constructor(private times: number, private delay: number, private fn: (iteration: number) => void) {
			this.duration = delay
		}
		
		public update(time): boolean {
			this.duration -= time
			if (this.duration <= 0) {
				return this.call()
			}
			return false
		}
		
		public start(): void {}
		
		public clone(): RepeatAction {
			return new RepeatAction(this.times, this.delay, this.fn)
		}
		
		private call() {
			if (this.times == 0) return this.complete()
			this.fn(this.iteration)
			
			++this.iteration
			if (this.times == this.iteration) return this.complete()
			this.duration = this.delay
		}
		
		private complete() {
			this.times = null
			this.delay = null
			this.fn = null
			return true
		}
	}
	
	export class SequenceAction implements Action {
		private nextIndex = 0
		private current: Action
		
		constructor(private actions: Array<Action>) {
			this.next()
		}
		
		public update(time): boolean {
			if (this.current.update(time)) {
				return this.next()
			}
			return false
		}
		
		public start(): void {}
		
		public clone(): SequenceAction {
			return new SequenceAction(_tc.cloneArray(this.actions))
		}
		
		private next(): boolean {
			if (this.nextIndex == this.actions.length) {
				return true
			}
			this.current = this.actions[this.nextIndex]
			this.current.start()
			++this.nextIndex
			return false
		}
	}
	
	export class ParallelAction implements Action {
		private completions: Array<Boolean>
		
		constructor(private actions: Array<Action>) {
			this.completions = new Array(actions.length)
		}
		
		public update(time): boolean {
			let completed = 0
			for (let i = 0; i < this.actions.length; i++) {
				if (this.completions[i]) {
					++completed
				}
				else if (this.actions[i].update(time)) {
					++completed
					this.completions[i] = true
				}
			}
			
			if (completed == this.actions.length) {
				this.completions.length = 0
				this.actions.length = 0
				this.completions = null
				this.actions = null
				return true
			}
			
			return false
		}
		
		public start(): void {
			for (const action of this.actions) {
				action.start()
			}
		}
		
		public clone(): ParallelAction {
			return new ParallelAction(_tc.cloneArray(this.actions))
		}
	}
	
	abstract class MotionAction<T> implements Action {
		private time: number = 0
		
		protected constructor(protected duration: number, protected target: T, protected easing: TweenEasing) {}
		
		public update(time): boolean {
			this.time += time
			if (this.time >= this.duration) {
				this.move(1)
				this.complete()
				return true
			}
			this.move(this.easing(this.time / this.duration))
			
			return false
		}
		
		public abstract start(): void
		
		public abstract clone(): MotionAction<T>
		
		protected complete() {
			this.duration = null
			this.target = null
			this.easing = null
		}
		
		protected abstract move(k: number)
	}
	
	export class UpdateAction extends MotionAction<(p: number) => void> {
		private delta: number
		
		constructor(private from: number, private to: number, duration: number, target: (p: number) => void, easing: TweenEasing) {
			super(duration, target, easing)
		}
		
		public start(): void {
			this.delta = this.to - this.from
			this.move(0)
		}
		
		public clone(): UpdateAction {
			return new UpdateAction(this.from, this.to, this.duration, this.target, this.easing)
		}
		
		protected move(k: number) {
			this.target(this.from + this.delta * k)
		}
		
		protected complete() {
			super.complete()
			this.from = null
			this.to = null
			this.delta = null
		}
	}
	
	export class UpdateLongAction extends MotionAction<(p: Long) => void> {
		private step: Long
		private delta: Long
		
		constructor(private from: Long, private to: Long, duration: number, target: (p: Long) => void, easing: TweenEasing) {
			super(duration, target, easing)
		}
		
		public start(): void {
			this.delta = this.to.minus(this.from)
			this.step = this.delta.divNumber(this.duration / 16.666  | 0)
			if (this.step.isZero()) this.step = Long.ONE
			
			this.move(0)
		}
		
		public clone(): UpdateLongAction {
			return new UpdateLongAction(this.from, this.to, this.duration, this.target, this.easing)
		}
		
		protected move(k: number) {
			if (k == 1) {
				this.target(this.to)
			}
			else {
				this.target(this.from.plus(this.step.multiplyNumber(this.duration * k / 16.666 | 0)))
			}
		}
		
		protected complete() {
			super.complete()
			this.from = null
			this.to = null
			this.delta = null
		}
	}
	
	export class NodeMotionAction extends MotionAction<Node> {
		constructor(duration: number, target: Node, easing: TweenEasing, private motions: Array<_tn.NodeMotion>) {
			super(duration, target, easing)
		}
		
		public start(): void {
			for (const motion of this.motions) {
				motion.start(this.target)
			}
		}
		
		public clone(): NodeMotionAction {
			return new NodeMotionAction(this.duration, this.target, this.easing, _tc.cloneArray(this.motions))
		}
		
		protected move(k: number) {
			for (const motion of this.motions) {
				motion.move(k)
			}
		}
		
		protected complete() {
			for (const motion of this.motions) {
				motion.complete()
			}
			
			this.motions.length = 0
			this.motions = null
			
			super.complete()
		}
	}
	
	export class ObjectMotionAction extends MotionAction<Object> {
		private motions = new Map<string, ObjectMotionAction_Motion>()
		
		constructor(duration: number, target: Object, easing: TweenEasing, private keys: Array<string>, private to: Object) {
			super(duration, target, easing)
		}
		
		public start(): void {
			for (const key of this.keys) {
				const from = this.target[key]
				this.motions.set(key, new ObjectMotionAction_Motion(from, this.to[key] - from))
			}
		}
		
		public clone(): ObjectMotionAction {
			return new ObjectMotionAction(this.duration, this.target, this.easing, this.keys, this.to)
		}
		
		protected move(k: number) {
			for (const key of this.keys) {
				this.target[key] = this.motions.get(key).calculate(k)
			}
		}
		
		protected complete() {
			for (const key of this.keys) {
				this.target[key] = this.to[key]
			}
			
			this.keys = null
			this.to = null
			
			this.motions.clear()
			this.motions = null
			
			super.complete()
		}
		
	}
	
	class ObjectMotionAction_Motion {
		constructor(public from: number, public delta: number) {}
		
		public calculate(k: number) {
			return this.from + this.delta * k
		}
	}
}