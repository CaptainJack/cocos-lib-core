export interface Queue<E> {
	add(element: E): Boolean
	
	poll(): E | null
	
	clear()
	
	isEmpty(): boolean
}