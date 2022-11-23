import {Application} from '../Application'
import {StoppableTemporalAssistantProxy} from '../../capjack/tool/utils/assistant/StoppableTemporalAssistantProxy'
import {WgsTemporalAssistant} from '../../capjack/tool/utils/assistant/WgTemporalAssistant'
import {Logging} from '../../capjack/tool/logging/Logging'
import {tween} from './tween/tween'
import {Level} from '../../capjack/tool/logging/Level'
import {SystemLocalStorage} from './SystemLocalStorage'
import {Localization} from '../Localization'
import {Localization_RU} from './Localization_RU'
import {LocalizationConfig} from './LocalizationConfig'
import {Audio} from '../Audio'
import {WorkerEventChannel} from '../../events/WorkerEventChannel'
import {AudioImpl} from './audio/AudioImpl'
import {Bundler} from '../Bundler'
import {BundlerImpl} from './BundlerImpl'

export class ApplicationImpl implements Application {
	public readonly debug: boolean
	public readonly assistant: StoppableTemporalAssistantProxy
	public readonly tweener: tween.TweenerImpl
	public readonly storage: SystemLocalStorage
	public readonly localization: Localization
	public readonly localization2: Localization
	public readonly events: WorkerEventChannel<any>
	public readonly audio: Audio
	public readonly bundler: Bundler
	
	private _stopped: boolean = false
	
	constructor(name: string, config: any) {
		this.debug = !!config.debug
		
		this.assistant = new StoppableTemporalAssistantProxy(new WgsTemporalAssistant(globalThis, e => this.handleError(e)))
		this.tweener = new tween.TweenerImpl(scene.node, e => this.handleError(e))
		this.storage = new SystemLocalStorage(name)
		this.localization = new Localization_RU(new LocalizationConfig('.', ','))
		this.events = new WorkerEventChannel(this.assistant, e => this.handleError(e))
		this.audio = new AudioImpl(scene.node, this.tweener)
		this.bundler = new BundlerImpl({}, this.assistant, e => this.handleError(e))
		
		this.localization2 = new Localization_RU(new LocalizationConfig(' ', ','))
		
		window.addEventListener('error', () => this.stop())
		
		const log = config.log as Record<string, string>
		
		if (log) {
			for (const name of Object.keys(log)) {
				if (name == '_') {
					Logging.setLevel(Level[log[name]])
				}
				else {
					Logging.setLevelFor(name, Level[log[name]])
				}
			}
		}
	}
	
	private stop() {
		if (!this._stopped) {
			this._stopped = true
			this.audio.stop()
			this.events.clear()
			this.tweener.stop()
			this.assistant.stop()
		}
	}
	
	private handleError(error: Error) {
		this.stop()
		
		scene.catchError(error)
	}
}