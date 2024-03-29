import {Component, Node} from 'cc'
import {NodeTweenParameters, ObjectTweenParameters, Tween, TweenActions, TweenEasing, Tweener, TweenParallel, TweenSequence} from '../../Tweener'
import {tween_action as _ta} from './tween-action'
import {tween_node as _tn} from './tween-node'
import {tween_common as _tc} from './tween-common'
import {Cancelable} from '../../../capjack/tool/utils/Cancelable'
import {extractError} from '../../../capjack/tool/lang/_errors'
import {Logging} from '../../../capjack/tool/logging/Logging'
import {isFunction, isNullable, require} from '../../../capjack/tool/lang/_utils'
import {Long} from '../../../capjack/tool/lang/Long'

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
		
		public update(a: any, b: any, c?: any, d?: any, e?: any): Cancelable {
			if (this.alive) {
				const tween = new DisposableTween()
				// @ts-ignore
				tween.update(a, b, c, d, e)
				return tween.start(this)
			}
			return Cancelable.DUMMY
		}
		
		public schedule(duration: number, fn?: () => void): Cancelable {
			return this.sequence(s => s.delay(duration, fn))
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
	
	function ensureEasing(easing: TweenEasing): TweenEasing {
		return isNullable(easing) ? TweenEasing.linear : easing
	}
	
	class TweenUpdater extends Component {
		public updater: (time: number) => void
		
		protected update(time: number) {
			this.updater(time * 1000)
		}
	}
	
	abstract class TweenActionsImpl implements TweenActions {
		public actions = new Array<_ta.Action>()
		
		public destroy() {
			this.actions.length = 0
			this.actions = null
		}
		
		public call(fn: () => void): this {
			return this.add(new _ta.CallAction(fn))
		}
		
		public pause(fn: (resume: () => void) => void): this {
			return this.add(new _ta.PauseAction(fn))
		}
		
		public delay(duration: number, fn?: () => void): this {
			require(duration >= 0)
			return this.add(new _ta.DelayAction(duration, fn))
		}
		
		public repeatCall(times: number, delay: number, fn: (iteration: number) => void): this {
			require(times >= 0)
			return this.add(new _ta.RepeatAction(times, delay, fn))
		}
		
		public abstract repeatSequence(times: number, delay: number, builder: (sequence: TweenSequence) => void): this
		
		public update(duration: number, fn: (p: number) => void, easing?: TweenEasing): this
		public update(duration: number, from: number, to: number, fn: (v: number) => void, easing?: TweenEasing): this
		public update(duration: number, from: Long, to: Long, fn: (v: Long) => void, easing?: TweenEasing): this
		public update(duration: number, from: ((p: number) => void) | number | Long, to?: TweenEasing | number | Long, fn?: ((v: number) => void) | ((v: Long) => void), easing?: TweenEasing): this {
			require(duration >= 0)
			
			if (from instanceof Long || to instanceof Long) {
				from = Long.from(from as number)
				to = Long.from(to as number)
				easing = ensureEasing(easing)
				
				if (!from.isHigh() && !to.isHigh()) {
					if (fn) {
						const oldFn = fn as (v: Long) => void
						fn = (v: number) => oldFn(Long.from(v))
					}
					return this.add(new _ta.UpdateAction(from.toInt(), to.toInt(), duration, fn as (v: number) => void, easing))
				}
				
				return this.add(new _ta.UpdateLongAction(from, to, duration, fn as (v: Long) => void, easing))
			}
			
			if (isFunction(from)) {
				fn = from
				easing = to as TweenEasing
				from = 0
				to = 1
			}
			
			return this.add(new _ta.UpdateAction(from, to as number, duration, fn as (v: number) => void, ensureEasing(easing)))
		}
		
		public to(target: any, duration: number, parameters: any, easing?: TweenEasing): this {
			require(duration >= 0)
			
			easing = ensureEasing(easing)
			
			const action = target instanceof Node
				? this.createNodeMotionAction(target, duration, parameters, easing)
				: this.createObjectMotionAction(target, duration, parameters, easing)
			return this.add(action)
		}
		
		protected add(action: _ta.Action): this {
			this.actions.push(action)
			return this
		}
		
		private createNodeMotionAction(target: Node, duration: number, parameters: NodeTweenParameters, easing: TweenEasing): _ta.Action {
			const motions = _tn.factoryMotions(parameters)
			return new _ta.NodeMotionAction(duration, target, easing, motions)
		}
		
		private createObjectMotionAction<T>(target: T, duration: number, parameters: ObjectTweenParameters<T>, easing: TweenEasing): _ta.Action {
			const keys = Object.keys(parameters)
			return new _ta.ObjectMotionAction(duration, target, easing, keys, parameters)
		}
	}
	
	class TweenSequenceImpl extends TweenActionsImpl implements TweenSequence {
		
		public to(target: any, duration: number, parameters: any, easing?: TweenEasing): this {
			if (Array.isArray(target)) {
				this.parallel(p => {
					for (const t of target) p.to(t, duration, parameters, easing)
				})
				return this
			}
			
			return super.to(target, duration, parameters, easing);
		}
		
		public parallel(builder: (p: TweenParallel) => void): this {
			const b = new TweenParallelImpl()
			builder(b)
			return this.add(new _ta.ParallelAction(b.actions))
		}
		
		public repeatSequence(times: number, delay: number, builder: (sequence: TweenSequence) => void): this {
			while (true) {
				builder(this)
				if (--times == 0) break
				if (delay > 0) this.delay(delay)
			}
			return this
		}
	}
	
	class TweenParallelImpl extends TweenActionsImpl implements TweenParallel {
		
		public to(target: any, duration: number, parameters: any, easing?: TweenEasing): this {
			if (Array.isArray(target)) {
				for (const t of target) super.to(t, duration, parameters, easing)
				return this
			}
			
			return super.to(target, duration, parameters, easing);
		}
		
		public sequence(builder: (sequence: TweenSequence) => void): this {
			const sequence = new TweenSequenceImpl()
			builder(sequence)
			return this.add(new _ta.SequenceAction(sequence.actions))
		}
		
		public repeatSequence(times: number, delay: number, builder: (sequence: TweenSequence) => void): this {
			const sequence = new TweenSequenceImpl()
			while (true) {
				builder(sequence)
				if (--times == 0) break
				if (delay > 0) sequence.delay(delay)
			}
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
		
		public delay(duration: number, fn?: () => void): this {
			if (this.alive) super.delay(duration, fn)
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
		
		public pause(fn: (resume: () => void) => void): this {
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
		
		public repeatCall(delay: number, times: number, fn: (iteration: number) => void): this {
			return this
		}
		
		public update(duration: number, from: any, to?: any, fn?: any, easing?: TweenEasing): this {
			return this
		}
		
		public repeatSequence(times: number, delay: number, builder: (sequence: TweenSequence) => void): this {
			return this
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

