import {Asset, AssetManager, assetManager, ImageAsset, resources, Sprite, SpriteFrame, Texture2D} from 'cc'
import {Class} from '../capjack/tool/lang/_types'
import {_string} from '../capjack/tool/lang/_string'
import {asNullable, isNullable, isString} from '../capjack/tool/lang/_utils'

export namespace _assets {
	
	const existsCache = new Map<string, boolean>()
	
	export function exists(path: string): boolean {
		let e = existsCache.get(path)
		if (!isNullable(e)) return e
		
		e = false
		const i = path.indexOf(':')
		if (i > 0) {
			const bundle = assetManager.getBundle(path.substring(0, i))
			if (bundle) e = !!bundle.getInfoWithPath(path.substring(i + 1))
		}
		else {
			e = !!assetManager.getBundle('core').getInfoWithPath(path)
		}
		
		existsCache.set(path, e)
		
		return e
	}
	
	export function get<T extends Asset>(path: string, type: Class<T>): T {
		const i = path.indexOf(':')
		
		let asset: T
		if (i > 0) {
			asset = getFromBundle(path.substring(0, i), path.substring(i + 1), type)
		}
		else {
			asset = getFromBundle('core', path, type)
		}
		
		if (!asset) {
			throw new Error(`Asset '${path}' is not exists`)
		}
		
		return asset
	}
	
	function getFromBundle<T extends Asset>(bundle: string | AssetManager.Bundle, path: string, type: Class<T>): T | null {
		if (type === SpriteFrame) {
			path = _string.endWith(path, '/spriteFrame')
		}
		
		if (isString(bundle)) {
			bundle = assetManager.getBundle(bundle)
			if (!bundle) return null
		}
		
		// @ts-ignore
		return bundle.get(path, type)
	}
	
	export function loadSpriteFrame(url: string, receiver: Sprite | ((s: SpriteFrame) => void)) {
		assetManager.loadRemote<ImageAsset>(url, {ext: '.png'}, (error, asset) => {
				if (!error) {
					const texture = new Texture2D()
					const spriteFrame = new SpriteFrame()
					texture.image = asset
					spriteFrame.texture = texture
					if (receiver instanceof Sprite) {
						receiver.spriteFrame = spriteFrame
					}
					else {
						receiver(spriteFrame)
					}
				}
			}
		)
	}
}