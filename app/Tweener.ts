import {easing, Node} from 'cc'
import {Cancelable} from '../capjack/tool/utils/Cancelable'
import {BezierCurve} from '../tools/BezierCurve'
import {Long} from '../capjack/tool/lang/Long'

export interface Tweener {
	tween(): Tween
	to(target: Node | Array<Node>, duration: number, parameters: NodeTweenParameters, easing?: TweenEasing): Cancelable
	
	to<T>(target: T, duration: number, parameters: ObjectTweenParameters<T>, easing?: TweenEasing): Cancelable
	
	sequence(builder: (sequence: TweenSequence) => void): Cancelable
	
	parallel(builder: (parallel: TweenParallel) => void): Cancelable
	
	loop(builder: (sequence: TweenSequence) => void): Cancelable
	
	update(duration: number, fn: (p: number) => void, easing?: TweenEasing): Cancelable
	
	update(duration: number, from: number, to: number, fn: (v: number) => void, easing?: TweenEasing): Cancelable
	
	update(duration: number, from: Long, to: Long, fn: (v: Long) => void, easing?: TweenEasing): Cancelable
	
	schedule(duration: number, fn?: () => void): Cancelable
}

export interface TweenActions {
	to(target: Node | Array<Node>, duration: number, parameters: NodeTweenParameters, easing?: TweenEasing): this
	
	to<T>(target: T, duration: number, parameters: ObjectTweenParameters<T>, easing?: TweenEasing): this
	
	delay(duration: number, fn?: () => void): this
	
	call(fn: () => void): this
	
	repeatCall(times: number, delay: number, fn: (iteration: number) => void): this
	
	repeatSequence(times: number, delay: number, builder: (sequence: TweenSequence) => void): this
	
	update(duration: number, fn: (p: number) => void, easing?: TweenEasing): this
	
	update(duration: number, from: number, to: number, fn: (v: number) => void, easing?: TweenEasing): this
	
	update(duration: number, from: Long, to: Long, fn: (v: Long) => void, easing?: TweenEasing): this
}

export interface TweenSequence extends TweenActions {
	parallel(builder: (p: TweenParallel) => void): this
}

export interface TweenParallel extends TweenActions {
	sequence(builder: (sequence: TweenSequence) => void): this
}

export interface Tween extends TweenSequence {
	start(): Cancelable
	
	destroy()
}

export interface TweenParameters {
}

export type TweenCalculator<T> = (k: number, from: T, to: T, delta: T) => T

export type TweenParameter<T> = T | {to: T, from?: T, calc?: TweenCalculator<T>}

export type TweenParameterOpacity<T> = TweenParameter<T> & {active?: boolean}


export type TweenPosition = {x: number, y: number}

export interface NodeTweenParameters extends TweenParameters {
	scale?: TweenParameter<number>
	scaleX?: TweenParameter<number>
	scaleY?: TweenParameter<number>
	width?: TweenParameter<number>
	height?: TweenParameter<number>
	x?: TweenParameter<number>
	y?: TweenParameter<number>
	opacity?: TweenParameterOpacity<number>,
	position?: TweenParameter<TweenPosition> | BezierCurve,
	update?: (p: number) => void
}

export type ObjectTweenParameters<T> = Record<string, number>

export type TweenEasing = (k: number) => number

export const TweenEasing = easing

export namespace TweenCalculator {
	
	export function direct(k: number, from: number, to: number, delta: number) {
		return k == 1 ? to : from + delta * k
	}
	
	export function directPosition(k: number, from: TweenPosition, to: TweenPosition, delta: TweenPosition) {
		return k == 1 ? to : {x: from.x + delta.x * k, y: from.y + delta.y * k}
	}
	
	export function pulse<T>(k: number, from: number, to: number, delta: number): number {
		if (k === 1) return from
		if (k === 0.5) return to
		
		k = k * 2 - 1
		k = -(k * k) + 1
		
		return from + delta * k
	}
}