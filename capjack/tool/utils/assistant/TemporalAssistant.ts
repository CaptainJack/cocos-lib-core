import {Assistant} from "./Assistant";
import {Cancelable} from "../Cancelable";

export interface TemporalAssistant extends Assistant {
	schedule(delayMillis: number, code: () => void): Cancelable
	
	repeat(delayMillis: number, code: () => void): Cancelable
	
	wait(condition: () => boolean, action: () => void): Cancelable
}