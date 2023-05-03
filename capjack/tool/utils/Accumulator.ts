export interface Accumulator<T> {
	add(item: T): this
}