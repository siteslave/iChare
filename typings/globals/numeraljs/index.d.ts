// Generated by typings
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/56295f5058cac7ae458540423c50ac2dcf9fc711/numeraljs/numeraljs.d.ts
interface NumeralJSLanguage {
	delimiters: {
		thousands: string;
		decimal: string;
	};
	abbreviations: {
		thousand: string;
		million: string;
		billion: string;
		trillion: string;
	};
	ordinal(num: number): string;
	currency: {
		symbol: string;
	};
}

interface Numeral {
	(value?: any): Numeral;
	version: string;
	isNumeral: boolean;
	language(key: string, values?: NumeralJSLanguage): Numeral;
	zeroFormat(format: string): string;
	clone(): Numeral;
	format(inputString?: string): string;
	formatCurrency(inputString?: string): string;
	unformat(inputString: string): number;
	value(): number;
	valueOf(): number;
	set (value: any): Numeral;
	add(value: any): Numeral;
	subtract(value: any): Numeral;
	multiply(value: any): Numeral;
	divide(value: any): Numeral;
	difference(value: any): number;
}

declare var numeral: Numeral;

declare module "numeral" {

    export = numeral;

}
