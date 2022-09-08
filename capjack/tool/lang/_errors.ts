import {ObscureException} from './exceptions/ObscureException'

export function extractError(e: any): Error {
	if (e instanceof Error) return e
	return new ObscureException(e)
}

