import {Exception} from '../lang/exceptions/Exception'

export class BufferUnderflowException extends Exception {
	static createNoRead(requestedSize: number, availableSize: number): BufferUnderflowException {
		return new BufferUnderflowException(`Not enough data to read (requested: ${requestedSize}, available: ${availableSize})`)
	}
	
	static createNoReadBack(requestedSize: number, availableSize: number): BufferUnderflowException {
		return new BufferUnderflowException(`Not enough data to back read (requested: ${requestedSize}, available: ${availableSize})`)
	}
	
	static createNegative(negativeSize: number): BufferUnderflowException {
		return new BufferUnderflowException(`Reading size is negative (${negativeSize})`)
	}
	
	static createNegativeBack(negativeSize: number): BufferUnderflowException {
		return new BufferUnderflowException(`Back reading size is negative (${negativeSize})`)
	}
}

