export class NameAbbreviator {
	
	private readonly cache: { [name: string]: string } = {};
	
	constructor(private readonly lengthLimit: number, private readonly dotsLimit: number = 16) {
	}
	
	abbreviate(name: string): string {
		if (name.length < this.lengthLimit) {
			return name
		}
		
		const cached = this.cache[name];
		if (cached !== undefined) {
			return cached;
		}
		
		const dots = new Array<number>(this.dotsLimit);
		const dotCount = this.computeDots(name, dots);
		
		if (dotCount == 0) {
			return name;
		}
		
		const lengths = new Array<number>(this.dotsLimit + 1);
		this.computeLengths(name, dots, lengths, dotCount);
		
		let result = name.substr(0, lengths[0] - 1);
		
		for (let i = 0; i <= dotCount; i++) {
			result += name.substring(dots[i - 1], dots[i - 1] + lengths[i]);
		}
		
		this.cache[name] = result;
		
		return result
	}
	
	private computeLengths(name: String, dots: Array<number>, lengths: Array<number>, dotCount: number) {
		let toTrim = name.length - this.lengthLimit;
		let previousDot = -1;
		
		for (let i = 0; i < dotCount; i++) {
			const available = dots[i] - previousDot - 1;
			previousDot = dots[i];
			
			const len = toTrim > 0 ? (available < 1 ? available : 1) : available;
			
			toTrim -= available - len;
			lengths[i] = len + 1;
		}
		
		lengths[dotCount] = name.length - dots[dotCount - 1];
	}
	
	private computeDots(name: String, dots: Array<number>): number {
		let dotCount = 0;
		let k = 0;
		while (true) {
			k = name.indexOf('.', k);
			if (k != -1 && dotCount < this.dotsLimit) {
				dots[dotCount++] = k++;
			}
			else {
				break
			}
		}
		return dotCount;
	}
}