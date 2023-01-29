export class Event {
	constructor(public readonly name: string) {}
	
	public toString(): string {return this.name}
}