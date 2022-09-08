export interface EventDispatcher<E> {
	emit(event: E)
}