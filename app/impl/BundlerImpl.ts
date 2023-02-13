import {assetManager} from 'cc'
import {Bundler} from '../Bundler'
import {Logging} from '../../capjack/tool/logging/Logging'
import {Assistant} from '../../capjack/tool/utils/assistant/Assistant'
import {LoadingProcess} from '../../loading/LoadingProcess'
import {AbstractLoadingProcess} from '../../loading/AbstractLoadingProcess'

export class BundlerImpl implements Bundler {
	readonly logger = Logging.getLogger('app.bundler')
	
	private readonly loadHandlers = new Map<string, Array<() => void>>()
	
	constructor(
		readonly versions: Record<string, string>,
		readonly assistant: Assistant,
		private errorHandler: (error: Error) => void
	) {
	}
	
	public onLoaded(bundle: string, handler: () => void) {
		let handlers = this.loadHandlers.get(bundle)
		if (!handlers) {
			handlers = []
			this.loadHandlers.set(bundle, handlers)
		}
		handlers.push(handler)
	}
	
	public load(name: string): LoadingProcess<void> {
		return new BundleLoading(this, name)
	}
	
	public unload(name: string): void {
		this.doUnload(name)
	}
	
	public getVersion(name: string): string | undefined {
		return this.versions[name]
	}
	
	public handleBundleLoaded(name: string) {
		const handlers = this.loadHandlers.get(name)
		
		if (handlers) {
			this.loadHandlers.delete(name)
			for (const handler of handlers) {
				handler()
			}
		}
	}
	
	public handleError(error: Error) {
		this.errorHandler(error)
	}
	
	private doUnload(name: string) {
		const bundle = assetManager.getBundle(name)
		bundle.releaseAll()
		assetManager.removeBundle(bundle)
	}
}

class BundleLoading extends AbstractLoadingProcess<void> implements LoadingProcess<void> {
	_progress: number = 0
	
	constructor(private bundler: BundlerImpl, private name: string) {
		super()
		
		assetManager.loadBundle(name, {version: bundler.getVersion(name)}, (e, bundle) => {
			if (e) {
				this.bundler.handleError(e)
			}
			else {
				this._progress = 0.01
				bundle.loadDir('',
					(completed, total) => this.handleProgress(completed, total),
					(error) => this.handleComplete(error)
				)
			}
		})
	}
	
	protected calcProgress(): number {
		return this._progress
	}
	
	private handleProgress(completed: number, total: number) {
		const p = 0.01 + (completed / total) * 0.99
		if (p > this.progress) {
			this._progress = p
		}
	}
	
	private handleComplete(error: Error | null) {
		if (error) {
			this.bundler.handleError(error)
		}
		else {
			this.bundler.handleBundleLoaded(this.name)
			this.doComplete()
		}
	}
}