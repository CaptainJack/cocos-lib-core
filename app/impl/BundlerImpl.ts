import {assetManager} from 'cc'
import {Bundler} from '../Bundler'
import {Logging} from '../../capjack/tool/logging/Logging'
import {Assistant} from '../../capjack/tool/utils/assistant/Assistant'
import {LoadingProcess} from '../../loading/LoadingProcess'
import {isString} from '../../capjack/tool/lang/_utils'
import {CompositeLoadingProcess} from '../../loading/CompositeLoadingProcess'
import {_string} from '../../capjack/tool/lang/_string'
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
	
	public load(names: string | Array<string>): LoadingProcess {
		if (isString(names)) {
			return new BundleLoading(this, names)
		}
		return new CompositeLoadingProcess(names.map(n => new BundleLoading(this, n)))
	}
	
	public loadWithAssets(bundle: string, assets: Array<string>): LoadingProcess {
		return new BundleLoading(this, bundle, assets)
	}
	
	public unloadWithoutAssets(bundle: string, assets: Array<string>): void {
		const b = assetManager.getBundle(bundle)
		const infos = b.getDirWithPath('')
		for (const info of infos) {
			if (!_string.startsWith(info.path, assets)) {
				b.release(info.path)
			}
		}
	}
	
	public unload(names: string | Array<string>): void {
		if (isString(names)) {
			this.doUnload(names)
		}
		else {
			for (const name of names) {
				this.doUnload(name)
			}
		}
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

class BundleLoading extends AbstractLoadingProcess implements LoadingProcess {
	_progress: number = 0
	
	constructor(private bundler: BundlerImpl, private name: string, assets?: Array<string>) {
		super()
		
		assetManager.loadBundle(name, {version: bundler.getVersion(name)}, (e, bundle) => {
			if (e) {
				this.bundler.handleError(e)
			}
			else {
				this._progress = 0.01
				if (assets) {
					bundle.load(assets,
						(completed, total) => this.handleProgress(completed, total),
						(error) => this.handleComplete(error)
					)
				}
				else {
					bundle.loadDir('',
						(completed, total) => this.handleProgress(completed, total),
						(error) => this.handleComplete(error)
					)
				}
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