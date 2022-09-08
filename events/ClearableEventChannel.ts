import {EventChannel} from './EventChannel'

export interface ClearableEventChannel<E> extends EventChannel<E> {
	clear()
}