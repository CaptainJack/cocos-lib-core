declare namespace devtodev {
	
	function setUserId(id: string)
	
	function setCurrentLevel(level: number)
	
	function levelUp(
		level: number,
		balance?: Record<string, number>,
		spent?: Record<string, number>,
		earned?: Record<string, number>,
		bought?: Record<string, number>
	): void
	
	function currentBalance(balance: Record<string, number>)
	
	function realCurrencyPayment(orderId: string, price: number, productId: string, currencyCode: string)
	
	function tutorial(step: number)
	
	namespace user {
		function set(key: string, value: any)
		
		function getValue(key: string)
		
		function unset(key: string)
		
		function clearUser()
		
		function setName(value: string)
		
		function setEmail(value: string)
		
		function setPhone(value: string)
		
		function setPhoto(value: string)
		
		function setGender(value: number) // 0 (Unknown), 1 (Male), 2 (Female)
		
		function setAge(value: number)
	}
}
