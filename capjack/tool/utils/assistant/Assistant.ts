import {Cancelable} from "../Cancelable";

export interface Assistant {
	execute(code: () => void): void
	
	executeOn(target: any, code: () => void): void
	
	charge(code: () => void): Cancelable
	
	chargeOn(target: any, code: () => void): Cancelable
}