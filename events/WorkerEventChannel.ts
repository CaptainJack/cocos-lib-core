import {DirectEventChannel} from './DirectEventChannel'
import {Assistant} from '../capjack/tool/utils/assistant/Assistant'
import {Worker} from '../capjack/tool/utils/worker/Worker'
import {requireNotNullable} from '../capjack/tool/lang/_utils'

export class WorkerEventChannel<E> extends DirectEventChannel<E> {
	
	private readonly _worker: Worker
	
	constructor(assistant: Assistant, errorHandler: (e: Error) => void) {
		super()
		this._worker = new Worker(assistant, errorHandler)
	}
	
	emit(event) {
		requireNotNullable(event)
		this._worker.defer(() => super.emit(event))
	}
}
