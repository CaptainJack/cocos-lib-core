import {Volumeable} from '../../Audio'
import {Tweener} from '../../Tweener'
import {Cancelable} from '../../../capjack/tool/utils/Cancelable'
import {_number} from '../../../capjack/tool/lang/_number'
import {isNullable} from '../../../capjack/tool/lang/_utils'

export abstract class AbstractVolumeable implements Volumeable {
	private _volume: number = 1
	private _smoothTween: Cancelable = Cancelable.DUMMY
	
	protected constructor(
		protected tweener: Tweener
	) {}
	
	public getVolume(): number {
		return this._volume
	}
	
	public setVolume(value: number) {
		value = _number.coerceIn(value, 0, 1)
		if (this._volume != value) {
			this._volume = value
			this.updateVolume()
		}
	}
	
	public smoothVolume(duration: number, volume: number)
	public smoothVolume(duration: number, from: number, to: number)
	public smoothVolume(duration: number, from: number, to?: number): Promise<void> {
		if (!this.tweener) return
		
		this._smoothTween.cancel()
		
		if (isNullable(to)) {
			to = from
			from = this._volume
		}
		else {
			this._volume = from
			this.updateVolume()
		}
		
		if (this._volume == to) {
			this._smoothTween = Cancelable.DUMMY
			return Promise.resolve()
		}
		
		return new Promise(resolve => {
			this._smoothTween = this.tweener.sequence(s => s
				.update(duration, from, to, v => this.setVolume(v))
				.call(resolve)
			)
		})
	}
	
	public stop() {
		this._smoothTween.cancel()
		this._smoothTween = null
		this.tweener = null
	}
	
	protected abstract updateVolume()
}