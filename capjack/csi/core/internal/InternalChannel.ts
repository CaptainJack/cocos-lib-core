import {Channel} from "../Channel";

export interface InternalChannel extends Channel {
	writeByte(data: number): void
	
	writeArray(data: Int8Array): void
	
	closeWithMarker(marker: number)
}