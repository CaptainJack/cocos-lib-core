// noinspection DuplicatedCode

import {Assets} from '../Assets'
import {Asset, assetManager, AssetManager, ImageAsset, Sprite, SpriteFrame, Texture2D} from 'cc'
import {Class} from '../../capjack/tool/lang/_types'
import {LoadingProcess} from '../../loading/LoadingProcess'
import {isNullable, isString} from '../../capjack/tool/lang/_utils'
import {SceneOrientation} from '../../../../main/lib-main/Scene'
import {_string} from '../../capjack/tool/lang/_string'
import {AbstractLoadingProcess} from '../../loading/AbstractLoadingProcess'
import {CompositeLoadingProcess} from '../../loading/CompositeLoadingProcess'
import {DeferredLoadingProcess} from '../../loading/DeferredLoadingProcess'

export class AssetsImpl implements Assets {
	private existsCache = new Map<string, boolean>()
	
	constructor(
		private remoteUrl: string,
		private bundleDependencies: Record<string, Array<string>>,
		private errorHandler: (error: Error) => void
	) {
		this.remoteUrl = _string.endWith(remoteUrl, '/')
	}
	
	public exists(path: string): boolean {
		let e = this.existsCache.get(path)
		if (!isNullable(e)) return e
		
		e = false
		const i = path.indexOf(':')
		if (i > 0) {
			const pathBundle = path.substring(0, i)
			const pathRelative = path.substring(i + 1)
			const bundle = assetManager.getBundle(pathBundle)
			if (bundle) e = !!bundle.getInfoWithPath(pathRelative)
			if (!e) {
				const dependencies = this.bundleDependencies[pathBundle]
				if (dependencies) {
					for (const dependency of dependencies) {
						e = this.exists(dependency + ':' + pathRelative)
						if (e) break
					}
				}
			}
		}
		else if (scene.orientation === SceneOrientation.ABSENT) {
			e = !!assetManager.getBundle('core').getInfoWithPath(path)
		}
		else {
			e = !!assetManager.getBundle('core-' + SceneOrientation.nameLower(scene.orientation)).getInfoWithPath(path)
			if (!e) {
				e = !!assetManager.getBundle('core').getInfoWithPath(path)
			}
		}
		
		this.existsCache.set(path, e)
		
		return e
	}
	
	public get<T extends Asset>(path: string, type: Class<T>): T {
		const i = path.indexOf(':')
		
		let asset: T
		if (i > 0) {
			const pathBundle = path.substring(0, i)
			const pathRelative = path.substring(i + 1)
			asset = this.getFromBundle(pathBundle, pathRelative, type)
			if (!asset) {
				const dependencies = this.bundleDependencies[pathBundle]
				if (dependencies) {
					for (const dependency of dependencies) {
						asset = this.get(dependency + ':' + pathRelative, type)
						if (asset) break
					}
				}
			}
		}
		else if (scene.orientation === SceneOrientation.ABSENT) {
			asset = this.getFromBundle('core', path, type)
		}
		else {
			asset = this.getFromBundle('core-' + SceneOrientation.nameLower(scene.orientation), path, type)
			if (!asset) {
				asset = this.getFromBundle('core', path, type)
			}
		}
		
		if (!asset) {
			this.errorHandler(Error(`Asset '${path}' is not exists`))
			return null
		}
		
		return asset
	}
	
	public getOrNull<T extends Asset>(path: string, type: Class<T>): T | null {
		return this.exists(path) ? this.get(path, type) : null
	}
	
	public loadBundle(name: string): LoadingProcess<AssetManager.Bundle> {
		const dependencies: Array<string> = [name]
		this.collectBundleDependencies(name, dependencies)
		
		if (dependencies.length == 1) {
			return new BundleLoading(name, this.errorHandler)
		}
		
		return new QueuedBundleLoading(name, dependencies, this.errorHandler)
	}
	
	public loadExternalImage(path: string, target?: Sprite): LoadingProcess<SpriteFrame> {
		return this.loadOutsideImage(this.remoteUrl + path, target)
	}
	
	public loadOutsideImage(url: string, target?: Sprite): LoadingProcess<SpriteFrame> {
		return new OutsideImageLoading(url, target)
	}
	
	public unloadBundle(name: string) {
		const bundle = assetManager.getBundle(name)
		bundle.releaseAll()
		assetManager.removeBundle(bundle)
	}
	
	private getFromBundle<T extends Asset>(bundle: string | AssetManager.Bundle, path: string, type: Class<T>): T | null {
		if (type === SpriteFrame) {
			path = _string.endWith(path, '/spriteFrame')
		}
		
		if (isString(bundle)) {
			bundle = assetManager.getBundle(bundle)
			if (!bundle) return null
		}
		
		return bundle.get(path, type)
	}
	
	private collectBundleDependencies(name: string, dependencies: Array<string>) {
		const list = this.bundleDependencies[name]
		if (list) {
			for (const n of list) {
				dependencies.push(n)
				this.collectBundleDependencies(n, dependencies)
			}
		}
	}
}

class OutsideImageLoading extends AbstractLoadingProcess<SpriteFrame> {
	constructor(url: string, private target?: Sprite) {
		super()
		assetManager.loadRemote<ImageAsset>(url, {ext: '.png'}, (e, a) => this.onCompleteRemote(e, a))
	}
	
	protected calcProgress(): number {
		return 0
	}
	
	private onCompleteRemote(error: Error, asset: ImageAsset) {
		if (error) {
			this.doComplete(null)
		}
		else {
			const texture = new Texture2D()
			const frame = new SpriteFrame()
			texture.image = asset
			frame.texture = texture
			if (this.target) {
				this.target.spriteFrame = frame
			}
			this.doComplete(frame)
		}
	}
}

class QueuedBundleLoading extends CompositeLoadingProcess<AssetManager.Bundle> {
	constructor(name: string, private dependencies: Array<string>, private errorHandler: (error: Error) => void) {
		super(
			dependencies.map(() => new DeferredLoadingProcess()),
			() => assetManager.getBundle(name)
		)
		this.loadNext()
	}
	
	protected tryComplete() {
		super.tryComplete()
		if (this.dependencies.length > 0) {
			this.loadNext()
		}
	}
	
	private loadNext() {
		const name = this.dependencies.pop()
		const process = this.processes[this.dependencies.length] as DeferredLoadingProcess<AssetManager.Bundle>
		process.assign(new BundleLoading(name, this.errorHandler))
	}
}

class BundleLoading extends AbstractLoadingProcess<AssetManager.Bundle> {
	private _progress: number = 0
	private bundle: AssetManager.Bundle
	
	constructor(
		private name: string,
		private errorHandler: (error: Error) => void
	) {
		super()
		
		assetManager.loadBundle(name, (e, b) => this.handleCompleteBundle(e, b))
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
	
	private handleCompleteBundle(error: Error | null, bundle: AssetManager.Bundle) {
		if (error) {
			this.errorHandler(error)
		}
		else {
			this._progress = 0.01
			this.bundle = bundle
			bundle.loadDir('',
				(c, t) => this.handleProgress(c, t),
				e => this.handleCompleteDir(e)
			)
		}
	}
	
	private handleCompleteDir(error: Error | null) {
		if (error) {
			this.errorHandler(error)
		}
		else {
			this.doComplete(this.bundle)
			this.bundle = null
		}
	}
}