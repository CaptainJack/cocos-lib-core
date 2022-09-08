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

export class ApplicationImpl implements Application {
	public readonly devMode: boolean
	public readonly assistant: StoppableTemporalAssistantProxy
	public readonly tweener: tween.TweenerImpl
	public readonly storage: SystemLocalStorage
	public readonly localization: Localization
	public readonly events: WorkerEventChannel<any>
	public readonly audio: Audio
	
	constructor(name: string, config: any) {
		this.devMode = !!config.devMode
		
		this.assistant = new StoppableTemporalAssistantProxy(new WgsTemporalAssistant(globalThis, e => this.handleError(e)))
		this.tweener = new tween.TweenerImpl(scene.node, e => this.handleError(e))
		this.storage = new SystemLocalStorage(name)
		this.localization = new Localization_RU(new LocalizationConfig('.', ','))
		this.events = new WorkerEventChannel(this.assistant, e => this.handleError(e))
		this.audio = new AudioImpl(scene.node, this.tweener)
		
		window.addEventListener('error', e => this.stop())
		
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
		this.audio.stop()
		this.events.clear()
		this.tweener.stop()
		this.assistant.stop()
	}
	
	private handleError(error: Error) {
		this.stop()
		
		scene.catchError(error)
	}
}