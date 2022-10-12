import {CpdAdapter} from './CpdAdapter'
import {LocalStorage} from '../app/LocalStorage'
import {assetManager, sys} from 'cc'
import {UnsupportedOperationException} from '../capjack/tool/lang/exceptions/UnsupportedOperationException'
import {GuestBrowserAdapter} from './internal/GuestBrowserAdapter'
import {Exception} from '../capjack/tool/lang/exceptions/Exception'
import {extractError} from '../capjack/tool/lang/_errors'
import {OkBrowserAdapter} from './internal/OkBrowserAdapter'
import {VkBrowserAdapter} from './internal/VkBrowserAdapter'

export function initCpd(storage: LocalStorage): Promise<CpdAdapter> {
	return sys.isNative ? factoryNative() : factoryBrowser(storage)
}

function factoryNative(): Promise<CpdAdapter> {
	return Promise.reject(new UnsupportedOperationException())
}

function factoryBrowser(storage: LocalStorage): Promise<CpdAdapter> {
	const urp = extractUrlRequestParameters()
	
	// OK
	if (!!urp['api_server'] && !!urp['apiconnection'] && !!urp['logged_user_id']) {
		return factoryBrowserOk(storage, urp)
	}
	
	// VK
	if (!!urp['api_url'] && !!urp['api_id'] && !!urp['viewer_id']) {
		return factoryBrowserVk(storage, urp)
	}
	
	return factoryBrowserGuest(storage)
}

function factoryBrowserGuest(storage: LocalStorage): Promise<CpdAdapter> {
	return Promise.resolve(new GuestBrowserAdapter(storage))
}

function factoryBrowserOk(storage: LocalStorage, urp: {}): Promise<CpdAdapter> {
	return new Promise((resolve, reject) => {
		assetManager.downloader.downloadScript('//bo.capjack.ru/assets/cpd-ok.js', {scriptAsyncLoading: true}, error => {
			if (error) {
				reject(new Exception('Failed to load CPD OK', error))
			}
			else {
				FAPI.init(urp['api_server'], urp['apiconnection'],
					() => {
						resolve(new OkBrowserAdapter(storage, urp['logged_user_id']))
					},
					function (error) {
						reject(new Exception('Failed to init CPD OK', extractError(error)))
					}
				)
			}
		})
	})
}

function factoryBrowserVk(storage: LocalStorage, urp: {}): Promise<CpdAdapter> {
	return new Promise((resolve, reject) => {
		assetManager.downloader.downloadScript('//bo.capjack.ru/assets/cpd-vk.js', {scriptAsyncLoading: true}, error => {
			if (error) {
				reject(new Exception('Failed to load CPD VK', error))
			}
			else {
				vkBridge.send('VKWebAppInit')
					.then(d => {
						if (d.result) {
							resolve(new VkBrowserAdapter(storage, urp['viewer_id']))
						}
						else {
							reject(new Exception('Failed to init CPD VK'))
						}
					})
					.catch(e => reject(new Exception('Failed to init CPD VK', extractError(e))))
			}
		})
	})
}

function extractUrlRequestParameters() {
	const f = {}
	let c = window.location.search
	if (c) {
		c = c.substr(1)
		const e = c.split('&')
		for (let d = 0; d < e.length; d++) {
			const a = e[d].split('=')
			const b = a[0]
			let g = a[1]
			if (b !== undefined && g !== undefined) {
				g = decodeURIComponent(g.replace(/\+/g, ' '))
				f[b] = g
			}
		}
	}
	return f
}
