import {Component, easing, Node} from 'cc'
import {NodeTweenParameters, ObjectTweenParameters, Tween, TweenBase, TweenEasing, Tweener, TweenParallel, TweenSequence} from '../../Tweener'
import {tween_action as _ta} from './tween-action'
import {tween_node as _tn} from './tween-node'
import {tween_common as _tc} from './tween-common'
import {Cancelable} from '../../../capjack/tool/utils/Cancelable'
import {extractError} from '../../../capjack/tool/lang/_errors'
import {Logging} from '../../../capjack/tool/logging/Logging'
import {isNullable, isNumber, require} from '../../../capjack/tool/lang/_utils'

export namespace tween {
	
	export class TweenerImpl implements Tweener, UpdateDealer {
		private alive = true
		
		private updater: TweenUpdater
		private updateHandlers = new Set<UpdateHandler>()
		private updateOnQueue = new Array<UpdateHandler>()
		private updateOffQueue = new Array<UpdateHandler>()
		private updating: boolean = false
		
		constructor(node: Node, private errorHandler: (e: Error) => void) {
			this.updater = node.addComponent(TweenUpdater)
			this.updater.updater = this.tick.bind(this)
		}
		
		public onUpdate(handler: UpdateHandler): boolean {
			if (this.alive) {
				if (this.updating) {
					this.updateOnQueue.push(handler)
				}
				else {
					this.updateHandlers.add(handler)
				}
				return true
			}
			return false
		}
		
		public offUpdate(handler: UpdateHandler) {
			if (this.alive) {
				if (this.updating) {
					this.updateOffQueue.push(handler)
				}
				else {
					this.updateHandlers.delete(handler)
				}
			}
		}
		
		public tween(): Tween {
			if (this.alive) {
				return new ReusableTween(this)
			}
			return new DummyTween()
		}
		
		public parallel(builder: (p: TweenParallel) => void): Cancelable {
			if (this.alive) {
				const tween = new DisposableTween()
				return tween.parallel(builder).start(this)
			}
			return Cancelable.DUMMY
		}
		
		public sequence(builder: (s: TweenSequence) => void): Cancelable {
			if (this.alive) {
				const tween = new DisposableTween()
				builder(tween)
				return tween.start(this)
			}
			return Cancelable.DUMMY
		}
		
		public loop(builder: (s: TweenSequence) => void): Cancelable {
			if (this.alive) {
				const tween = new LoopTween(this)
				builder(tween)
				tween.start()
				return tween
			}
			return Cancelable.DUMMY
		}
		
		public to(target: any, duration: number, parameters: any, easing?: TweenEasing): Cancelable {
			if (this.alive) {
				const tween = new DisposableTween()
				tween.to(target, duration, parameters, easing)
				return tween.start(this)
			}
			return Cancelable.DUMMY
		}
		
		public update(duration: number, fn: (p: number) => void, easing?: TweenEasing): Cancelable
		public update(duration: number, from: number, to: number, fn: (v: number) => void, easing?: TweenEasing): Cancelable
		public update(a: number, b: ((p: number) => void) | number, c?: TweenEasing | number, d?: (v: number) => void, e?: TweenEasing): Cancelable {
			if (this.alive) {
				const tween = new DisposableTween()
				// @ts-ignore
				tween.update(a, b, c, d, e)
				return tween.start(this)
			}
			return Cancelable.DUMMY
		}
		
		public stop() {
			if (this.alive) {
				this.alive = false
				
				this.updater.destroy()
				this.updater = null
				
				this.updating = true
				for (const handler of this.updateHandlers) {
					handler.cancel()
				}
				
				this.updateHandlers.clear()
				this.updateHandlers = null
				
				this.updateOnQueue.length = 0
				this.updateOnQueue = null
				
				this.updateOffQueue.length = 0
				this.updateOffQueue = null
				
				this.errorHandler = null
			}
		}
		
		private tick(time: number) {
			if (this.updateHandlers.size === 0) return
			
			try {
				this.updating = true
				for (const handler of this.updateHandlers) {
					if (!this.alive) break
					handler.update(time)
				}
				this.updating = false
				
				if (this.alive) {
					if (this.updateOnQueue.length > 0) {
						for (const handler of this.updateOnQueue) this.updateHandlers.add(handler)
						this.updateOnQueue.length = 0
					}
					if (this.updateOffQueue.length > 0) {
						for (const handler of this.updateOffQueue) this.updateHandlers.delete(handler)
						this.updateOffQueue.length = 0
					}
				}
			}
			catch (e) {
				this.catchError(e)
			}
		}
		
		private catchError(e: any) {
			if (this.alive) {
				this.errorHandler(extractError(e))
				this.stop()
			}
			else {
				Logging.getLogger('app.Tweener').error('Tween error', e)
			}
		}
	}
	
	export interface UpdateHandler extends Cancelable {
		update(time): void
	}
	
	export interface UpdateDealer {
		onUpdate(handler: UpdateHandler): boolean
		
		offUpdate(handler: UpdateHandler): void
	}
	
	///
	
	function easingFromType(type: TweenEasing): _tc.Easing {
		return easing[TweenEasing[type]]
	}
	
	class TweenUpdater extends Component {
		public updater: (time: number) => void
		
		protected update(time: number) {
			this.updater(time * 1000)
		}
	}
	
	abstract class TweenBaseImpl implements TweenBase {
		public actions = new Array<_ta.Action>()
		
		public destroy() {
			this.actions.length = 0
			this.actions = null
		}
		
		public call(fn: () => void): this {
			return this.add(new _ta.CallAction(fn))
		}
		
		public delay(duration: number): this {
			require(duration >= 0)
			return this.add(new _ta.DelayAction(duration))
		}
		
		public repeat(times: number, delay: number, fn: (iteration: number) => void): this {
			require(times >= 0)
			return this.add(new _ta.RepeatAction(times, delay, fn))
		}
		
		public update(duration: number, fn: (p: number) => void, easing?: TweenEasing): this
		public update(duration: number, from: number, to: number, fn: (v: number) => void, easing?: TweenEasing): this
		public update(duration: number, from: ((p: number) => void) | number, to?: TweenEasing | number, fn?: (v: number) => void, easing?: TweenEasing): this {
			require(duration >= 0)
			if (!isNumber(from)) {
				fn = from
				easing = to
				from = 0
				to = 1
			}
			
			return this.add(new _ta.UpdateAction(from, to, duration, fn, easingFromType(isNullable(easing) ? TweenEasing.linear : easing)))
		}
		
		public to(target: any, duration: number, parameters: any, easing?: TweenEasing): this {
			require(duration >= 0)
			
			const e = easingFromType(isNullable(easing) ? TweenEasing.linear : easing)
			
			const action = target instanceof Node
				? this.createNodeMotionAction(target, duration, parameters, e)
				: this.createObjectMotionAction(target, duration, parameters, e)
			return this.add(action)
		}
		
		protected add(action: _ta.Action): this {
			this.actions.push(action)
			return this
		}
		
		private createNodeMotionAction(target: Node, duration: number, parameters: NodeTweenParameters, easing: _tc.Easing): _ta.Action {
			const motions = _tn.factoryMotions(parameters)
			return new _ta.NodeMotionAction(duration, target, easing, motions)
		}
		
		private createObjectMotionAction<T>(target: T, duration: number, parameters: ObjectTweenParameters<T>, easing: _tc.Easing): _ta.Action {
			const keys = Object.keys(parameters)
			return new _ta.ObjectMotionAction(duration, target, easing, keys, parameters)
		}
	}
	
	class TweenSequenceImpl extends TweenBaseImpl implements TweenSequence {
		public parallel(builder: (p: TweenParallel) => void): this {
			const b = new TweenParallelImpl()
			builder(b)
			return this.add(new _ta.ParallelAction(b.actions))
		}
	}
	
	class TweenParallelImpl extends TweenBaseImpl implements TweenParallel {
		public sequence(builder: (sequence: TweenSequence) => void): this {
			const sequence = new TweenSequenceImpl()
			builder(sequence)
			return this.add(new _ta.SequenceAction(sequence.actions))
		}
	}
	
	class DisposableTween extends TweenSequenceImpl {
		
		public start(dealer: UpdateDealer): Cancelable {
			const execution = new TweenExecution(dealer, this.actions)
			
			if (dealer.onUpdate(execution)) {
				return execution
			}
			
			execution.cancel()
			this.destroy()
			return Cancelable.DUMMY
		}
	}
	
	class LoopTween extends TweenSequenceImpl implements Cancelable {
		private execution: TweenExecution
		
		constructor(private dealer: UpdateDealer) {
			super()
		}
		
		public start() {
			this.call(() => this.nextExecution())
			this.nextExecution()
		}
		
		public cancel(): void {
			this.destroy()
		}
		
		public destroy() {
			if (this.execution) {
				this.execution.cancel()
				this.execution = null
			}
			this.dealer = null
			super.destroy()
		}
		
		private nextExecution() {
			this.execution = new TweenExecution(this.dealer, _tc.cloneArray(this.actions))
			
			if (!this.dealer.onUpdate(this.execution)) {
				this.execution.cancel()
				this.destroy()
			}
		}
	}
	
	class ReusableTween extends TweenSequenceImpl implements Tween {
		private alive = true
		
		constructor(private dealer: UpdateDealer) {
			super()
		}
		
		public start(): Cancelable {
			if (this.alive) {
				const execution = new TweenExecution(this.dealer, _tc.cloneArray(this.actions))
				if (this.dealer.onUpdate(execution)) {
					return execution
				}
				execution.cancel()
				this.destroy()
			}
			return Cancelable.DUMMY
		}
		
		public call(fn: () => void): this {
			if (this.alive) super.call(fn)
			return this
		}
		
		public delay(duration: number): this {
			if (this.alive) super.delay(duration)
			return this
		}
		
		public parallel(builder: (p: TweenParallel) => void): this {
			if (this.alive) super.parallel(builder)
			return this
		}
		
		public to(target: any, duration: number, parameters: any, easing?: TweenEasing): this {
			if (this.alive) super.to(target, duration, parameters, easing)
			return this
		}
		
		public destroy() {
			if (this.alive) {
				super.destroy()
				this.dealer = null
			}
		}
	}
	
	class TweenExecution implements UpdateHandler {
		private sequence: _ta.SequenceAction
		
		constructor(private dealer: UpdateDealer, actions: Array<_ta.Action>) {
			this.sequence = new _ta.SequenceAction(actions)
		}
		
		public update(time) {
			if (this.sequence && this.sequence.update(time)) {
				this.cancel()
			}
		}
		
		public cancel(): void {
			if (this.dealer) {
				this.dealer.offUpdate(this)
				this.dealer = null
				
				this.sequence = null
			}
		}
	}
	
	class DummyTweenSequence implements TweenSequence {
		public call(fn: () => void): this {
			return this
		}
		
		public delay(duration: number): this {
			return this
		}
		
		public parallel(builder: (p: TweenParallel) => void): this {
			return this
		}
		
		public to(target: any, duration: number, parameters: any, easing?: TweenEasing): this {
			return this
		}
		
		public repeat(delay: number, times: number, fn: (iteration: number) => void): this {
			return this
		}
		
		public update(duration: number, from: ((p: number) => void) | number, to?: TweenEasing | number, fn?: (v: number) => void, easing?: TweenEasing): this {
			return undefined
		}
		
	}
	
	class DummyTween extends DummyTweenSequence implements Tween {
		public call(fn: () => void): this {
			return this
		}
		
		public destroy() {
		}
		
		public start(): Cancelable {
			return Cancelable.DUMMY
		}
	}
}

