import {Director, director} from 'cc'
import {Long} from '../capjack/tool/lang/Long'
import {_object} from '../capjack/tool/lang/_object'

export interface LongCreepSettings {
	boundDuration?: number
	boundValue?: number
	instantReduction?: boolean
}

export class LongCreep {
	
	private value: Long = Long.ZERO
	private currentRunner: Runner
	private numberRunner: NumberRunner
	private longRunner: LongRunner
	private running: boolean = false
	private time: number
	
	private settings: LongCreepSettings
	
	constructor(
		private updater: (value: Long) => void,
		settings?: LongCreepSettings
	) {
		this.settings = _object.merge(settings || {}, {
			boundDuration: 2000,
			boundValue: 10000,
			instantReduction: true
		})
	}
	
	public destroy() {
		this.stopAnim()
	}
	
	public set(value: Long | number) {
		this.stopAnim()
		this.update(Long.from(value))
	}
	
	public run(value: Long | number) {
		if (this.settings.boundDuration == 0) {
			this.set(value)
			return
		}
		
		if (value instanceof Long) {
			if (value.isHigh() || this.value.isHigh()) {
				this.runLong(value)
			}
			else {
				this.runNumber(value.toNumber())
			}
		}
		else {
			if (this.value.isHigh()) {
				this.runLong(Long.fromNumber(value))
			}
			else {
				this.runNumber(value)
			}
		}
	}
	
	private update(value: Long) {
		this.value = value
		this.updater(value)
	}
	
	private runLong(value: Long) {
		if (!this.longRunner) {
			this.longRunner = new LongRunner(this.settings)
		}
		this.currentRunner = this.longRunner
		this.tryAnim(this.longRunner.run(this.value, value))
	}
	
	private runNumber(value: number) {
		if (!this.numberRunner) {
			this.numberRunner = new NumberRunner(this.settings)
		}
		this.currentRunner = this.numberRunner
		this.tryAnim(this.numberRunner.run(this.value.toInt(), value))
	}
	
	private tryAnim(b: boolean) {
		if (b) {
			this.startAnim()
		}
		else {
			this.stopAnim()
		}
		this.update(this.currentRunner.value)
	}
	
	private startAnim() {
		this.time = performance.now()
		if (!this.running) {
			this.running = true
			director.on(Director.EVENT_BEFORE_UPDATE, this.updateAnim, this)
		}
	}
	
	private updateAnim() {
		if (this.currentRunner.update()) {
			this.stopAnim()
		}
		this.update(this.currentRunner.value)
	}
	
	private stopAnim() {
		if (this.running) {
			this.running = false
			director.off(Director.EVENT_BEFORE_UPDATE, this.updateAnim, this)
		}
	}
}

interface Runner {
	readonly value: Long
	
	update(): boolean
}

class NumberRunner implements Runner {
	private readonly boundValue: number
	private readonly boundSteps: number
	private readonly boundStep: number
	private readonly instantReduction: boolean
	
	private current: number
	private target: number
	private increase: boolean
	private step: number
	
	constructor(settings: LongCreepSettings) {
		this.boundValue = settings.boundValue
		this.boundSteps = Math.ceil(settings.boundDuration / 16)
		this.boundStep = Math.ceil(settings.boundValue / this.boundSteps)
		this.instantReduction = settings.instantReduction
	}
	
	public get value(): Long {
		return Long.from(this.current)
	}
	
	public run(from: number, to: number): boolean {
		const delta = to - from
		
		this.current = from
		this.target = to
		this.increase = delta >= 0
		
		if (delta == 0 || (this.instantReduction && !this.increase)) {
			this.current = to
			return false
		}
		
		if (this.increase) {
			this.step = delta > this.boundValue ? Math.ceil(delta / this.boundSteps) : this.boundStep
		}
		else {
			this.step = -delta > this.boundValue ? Math.floor(delta / this.boundSteps) : -this.boundStep
		}
		
		return true
	}
	
	public update(): boolean {
		this.current += this.step
		
		if (this.increase) {
			if (this.current >= this.target) {
				this.current = this.target
				return true
			}
		}
		else {
			if (this.current <= this.target) {
				this.current = this.target
				return true
			}
		}
		
		return false
	}
}

class LongRunner implements Runner {
	private readonly boundValue: Long
	private readonly boundValueNegative: Long
	private readonly boundSteps: number
	private readonly boundStep: Long
	private readonly boundStepNegate: Long
	private readonly instantReduction: boolean
	
	private current: Long
	private target: Long
	private increase: boolean
	private step: Long
	
	constructor(private settings: LongCreepSettings) {
		this.boundValue = Long.from(settings.boundValue)
		this.boundSteps = Math.ceil(settings.boundDuration / 16)
		this.boundStep = Long.from(Math.ceil(settings.boundValue / this.boundSteps))
		this.instantReduction = settings.instantReduction
		
		if (!this.instantReduction) {
			this.boundValueNegative = this.boundValue.negate()
			this.boundStepNegate = this.boundStepNegate.negate()
		}
	}
	
	public get value(): Long {
		return this.current
	}
	
	public run(from: Long, to: Long): boolean {
		const delta = to.minus(from)
		
		this.current = from
		this.target = to
		this.increase = !delta.isNegative()
		
		if (delta.isZero() || (this.instantReduction && !this.increase)) {
			this.current = to
			return false
		}
		
		if (this.increase) {
			this.step = delta.great(this.boundValue) ? delta.divNumber(this.boundSteps) : this.boundStep
		}
		else {
			this.step = delta.less(this.boundValueNegative) ? delta.divNumber(this.boundSteps) : this.boundStepNegate
		}
		
		return true
	}
	
	public update(): boolean {
		this.current = this.current.plus(this.step)
		
		if (this.increase) {
			if (this.current.greatOrEqual(this.target)) {
				this.current = this.target
				return true
			}
		}
		else {
			if (this.current.lessOrEqual(this.target)) {
				this.current = this.target
				return true
			}
		}
		
		return false
	}
}