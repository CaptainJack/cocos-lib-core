import {native} from 'cc'
import {IllegalArgumentException} from '../capjack/tool/lang/exceptions/IllegalArgumentException'
import {isBoolean, isNullable, isNumber, isString} from '../capjack/tool/lang/_utils'
import {Long} from '../capjack/tool/lang/Long'
import {_map} from '../capjack/tool/lang/_map'

export namespace _native {
	/**
	 * method : package.class.method(parameter1, parameter2)result
	 * types:
	 *  s - string
	 *  i - int
	 *  f - float
	 *  b - boolean
	 */
	export function callJava(method: string, ...parameters: Array<any>): any {
		
		console.log("callJava", method, parameters.join())
		
		const i1 = method.lastIndexOf('.')
		const i2 = method.indexOf('(')
		const i3 = method.indexOf(')')
		
		const className = method.substring(0, i1).replace('.', '/')
		const methodName = method.substring(i1 + 1, i2)
		
		let methodSignature = method.substring(i2 + 1, i3).trim()
		if (methodSignature !== '') {
			methodSignature = methodSignature.split(',').map(convertJavaType).join('')
		}
		
		const result = method.substring(i3 + 1)
		
		if (result) {
			methodSignature = '(' + methodSignature + ')' + convertJavaType(result)
		}
		else {
			methodSignature = '(' + methodSignature + ')V'
		}
		
		parameters = parameters.map(convertJavaParameter)
		
		return native.reflection.callStaticMethod(className, methodName, methodSignature, ...parameters)
	}
	
	function convertJavaType(type: string): string {
		switch (type.trim()) {
			case 'i' :
				return 'I'
			case 'f' :
				return 'F'
			case 'b' :
				return 'Z'
			case 's' :
				return 'Ljava/lang/String;'
		}
		throw new IllegalArgumentException(type)
	}
	
	function convertJavaParameter(parameter: any): number | string | boolean {
		if (isNumber(parameter) || isString(parameter) || isBoolean(parameter)) return parameter
		if (parameter instanceof Long) return parameter.toString()
		if (isNullable(parameter)) return null
		if (!(parameter instanceof Map)) {
			parameter = Object.keys(parameter).map(k => [k, parameter[k]])
		}
		return _map.joinToString(parameter, ',', ':')
	}
}