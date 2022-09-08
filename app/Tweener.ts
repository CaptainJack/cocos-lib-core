import {Node} from 'cc'
import {Cancelable} from '../capjack/tool/utils/Cancelable'
import {BezierCurve} from '../tools/BezierCurve'

export interface Tweener {
	tween(): Tween
	
	to(target: Node, duration: number, parameters: NodeTweenParameters, easing?: TweenEasing): Cancelable
	
	to<T>(target: T, duration: number, parameters: ObjectTweenParameters<T>, easing?: TweenEasing): Cancelable
	
	sequence(builder: (sequence: TweenSequence) => void): Cancelable
	
	parallel(builder: (parallel: TweenParallel) => void): Cancelable
	
	loop(builder: (sequence: TweenSequence) => void): Cancelable
	
	update(duration: number, fn: (p: number) => void, easing?: TweenEasing): Cancelable

	update(duration: number, from: number, to: number, fn: (v: number) => void, easing?: TweenEasing): Cancelable
}

export interface TweenBase {
	to(target: Node, duration: number, parameters: NodeTweenParameters, easing?: TweenEasing): this
	
	to<T>(target: T, duration: number, parameters: ObjectTweenParameters<T>, easing?: TweenEasing): this
	
	delay(duration: number): this
	
	call(fn: () => void): this
	
	repeat(times: number, delay: number, fn: (iteration: number) => void): this
	
	update(duration: number, fn: (p: number) => void, easing?: TweenEasing): this
	
	update(duration: number, from: number, to: number, fn: (v: number) => void, easing?: TweenEasing): this
}


export interface TweenSequence extends TweenBase {
	parallel(builder: (p: TweenParallel) => void): this
}

export interface TweenParallel extends TweenBase{
	sequence(builder: (sequence: TweenSequence) => void): this
}

export interface Tween extends TweenSequence {
	start(): Cancelable
	
	destroy()
}

export interface TweenParameters {
}

export type TweenParameter<T> = T | {to: T, from?: T, mod?: (p: number, current: T, from: T, to: T) => T}

export interface NodeTweenParameters extends TweenParameters {
	scale?: TweenParameter<number>
	scaleX?: TweenParameter<number>
	scaleY?: TweenParameter<number>
	x?: TweenParameter<number>
	y?: TweenParameter<number>
	opacity?: TweenParameter<number>
	position?: TweenParameter<{x: number, y: number}> | BezierCurve,
	update?: (p: number) => void
}

export type ObjectTweenParameters<T> = Record<string, number>

export enum TweenEasing {
	linear,
	smooth,
	fade,
	constant,
	quadIn,
	quadOut,
	quadInOut,
	quadOutIn,
	cubicIn,
	cubicOut,
	cubicInOut,
	cubicOutIn,
	quartIn,
	quartOut,
	quartInOut,
	quartOutIn,
	quintIn,
	quintOut,
	quintInOut,
	quintOutIn,
	sineIn,
	sineOut,
	sineInOut,
	sineOutIn,
	expoIn,
	expoOut,
	expoInOut,
	expoOutIn,
	circIn,
	circOut,
	circInOut,
	circOutIn,
	elasticIn,
	elasticOut,
	elasticInOut,
	elasticOutIn,
	backIn,
	backOut,
	backInOut,
	backOutIn,
	bounceIn,
	bounceOut,
	bounceInOut,
	bounceOutIn
}
