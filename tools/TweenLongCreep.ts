import {Long} from '../capjack/tool/lang/Long'
import {Tweener} from '../app/Tweener'
import {isNullable} from '../capjack/tool/lang/_utils'
import {Cancelable} from '../capjack/tool/utils/Cancelable'

export class TweenLongCreep {
	
	private currentValue: Long = Long.ZERO
	private targetValue: Long = Long.ZERO
	private runner: Cancelable = Cancelable.DUMMY
	private runUpdater: (v: Long) => void
	
	constructor(
		private tweener: Tweener,
		private duration: number,
		private updater: (value: Long) => void,
	) {
		this.runUpdater = (v: Long) => this.update(v)
	}
	
	public destroy() {
		this.complete()
		this.runner = null
		this.runUpdater = null
	}
	
	public set(value: Long | number) {
		this.stop()
		this.targetValue = Long.from(value)
		this.update(this.targetValue)
	}
	
	public runAdd(value: Long | number, duration?: number) {
		this.stop()
		this.runTo(this.targetValue.plus(Long.from(value)), duration)
	}
	
	public runMinus(value: Long | number, duration?: number) {
		this.stop()
		this.runTo(this.targetValue.minus(Long.from(value)), duration)
	}
	
	public runTo(value: Long | number, duration?: number) {
		this.stop()
		this.targetValue = Long.from(value)
		this.runner = this.tweener.update(isNullable(duration) ? this.duration : duration, this.currentValue, this.targetValue, this.runUpdater)
	}
	
	private complete() {
		this.stop()
		this.updater(this.targetValue)
	}
	
	private stop() {
		this.runner.cancel()
		this.runner = Cancelable.DUMMY
	}
	
	private update(value: Long) {
		this.currentValue = value
		this.updater(value)
	}
}