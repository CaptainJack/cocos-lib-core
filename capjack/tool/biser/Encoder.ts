import {BiserWriter} from './BiserWriter'

export type Encoder<T> = (w: BiserWriter, v: T) => void
