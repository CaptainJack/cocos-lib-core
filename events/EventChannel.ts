import {EventDispatcher} from './EventDispatcher'
import {EventDealer} from './EventDealer'

export interface EventChannel<E> extends EventDispatcher<E>, EventDealer<E> {}