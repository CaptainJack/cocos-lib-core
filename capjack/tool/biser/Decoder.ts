import {BiserReader} from './BiserReader'

export type Decoder<T> = (r: BiserReader) => T
