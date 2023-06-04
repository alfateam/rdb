// declare namespace ORM {

import { JSONColumn } from "../typings";

// 	interface ORM {		
// 		table: (tableName: string) => Table<{}>;
// 		tableOf: <T>(tableName: string) => Table<T>;
// 	}


// }

// interface UuidColumnType {
// 	equal(value: string | null): Filter;
// }

// interface DateColumnType {
// 	greaterThan(value: Date): Filter;
// 	between(from: Date, to: Date): Filter;
// }

// interface StringColumnType {
// 	equal(value: string | null): Filter;
// 	greaterThan(value: string): Filter;
// 	startsWith(value: string): Filter;
// 	endsWith(value: string): Filter;
// }

// interface NumericColumnType {
// 	greaterThan(value: number): Filter;
// 	between(from: number, to: number): Filter;
// }

// interface ColumnType {
// 	string: () => StringColumnType;
// 	uuid: () => UuidColumnType;
// 	number: () => NumericColumnType;
// 	date: () => DateColumnType;
// }

// interface RawFilter {
// 	sql: string | (() => string);
// 	parameters?: any[];
// }

// interface Filter extends RawFilter {
// 	and<T extends RawFilter>(otherFilter: T): Filter;
// }

// type Table<T> = ((<U>(callback: (mapper: ColumnMapper<T>) => U) => MappedTable<T, U>) & MappedTable<T, T>);

// type FetchingStrategy<T> = {
// 	[K in keyof T]?: boolean | FetchingStrategy<T[K]>;
// } & {
// 	orderBy?: Array<OrderBy<Extract<keyof T, string>>>;
// 	limit?: number;
// 	offset?: number;
// };

// type OrderBy<T extends string> = `${T} ${'asc' | 'desc'}` | T;

// type ReferenceMapper<TFrom, TTo> = {
// 	by(foreignKey: keyof TFrom): MappedTable<any, TTo>;
// };

// type ColumnMapper<T> = {
// 	column: (columnName: string) => ColumnType;
// 	references: <TTo>(mappedTable: MappedTable<any, TTo>) => ReferenceMapper<T, TTo>;
// };

// type MappedTable<T, U> = ((<V>(callback: (mapper: ColumnMapper<U>) => V) => MappedTable<T, U & V>) & {
//     getOne: <FS extends FetchingStrategy<U>>(filter: Filter, fetchingStrategy: FS) => FetchedProperties<Required<U>, Required<FS>>;
// } & U);

// type AtLeastOneTrue<T> = {
// 	[K in keyof T]: T[K] extends true ? true : never;
// }[keyof T] extends never ? false : true;

// type ExtractColumns<T, TStrategy> = {
// 	[K in keyof TStrategy]: K extends keyof T
// 	? T[K] extends StringColumnType | UuidColumnType | NumericColumnType | DateColumnType ? TStrategy[K] : never
// 	: never
// }

// type FetchedProperties<T, TStrategy> = AtLeastOneTrue<RemoveNever<ExtractColumns<T, TStrategy>>> extends true
// 	? {
// 		[K in keyof T]: K extends keyof TStrategy
// 		? TStrategy[K] extends true 
// 			? T[K] extends StringColumnType | UuidColumnType | NumericColumnType | DateColumnType			
// 				? T[K]
// 				: FetchedProperties<Required<T[K]>, {}>		
// 			: TStrategy[K] extends false
// 				? never
// 				: FetchedProperties<Required<T[K]>, Required<TStrategy[K]>>			
// 		: never
// 	}
// 	: {
// 		[K in keyof T]: K extends keyof TStrategy
// 		? TStrategy[K] extends true 
// 			? T[K] extends StringColumnType | UuidColumnType | NumericColumnType | DateColumnType			
// 				? T[K]
// 				: FetchedProperties<Required<T[K]>, {}>		
// 			: TStrategy[K] extends false
// 				? never
// 				: FetchedProperties<Required<T[K]>, Required<TStrategy[K]>>			
// 		: NegotiateDefaultStrategy<T[K]>
// 	};

// type NegotiateDefaultStrategy<T> = T extends StringColumnType | UuidColumnType | NumericColumnType | DateColumnType ? T : never

// type RemoveNever<T> = {
// 	[K in keyof T as T[K] extends never ? never : K]: T[K] extends object ? RemoveNever<T[K]> : T[K]
// };

// declare const orm: ORM.ORM;
// export default orm;
//todo
declare namespace ORM {

	interface ORM {		
		table: (tableName: string) => Table<{}>;
		tableOf: <T>(tableName: string) => Table<T>;
	}
}

interface UuidColumnType {
	equal(value: string | null): Filter;
	eq(value: string): Filter;
	notEqual(value: string | null): Filter	
	ne(value: string): Filter	
	lessThan(value: string): Filter;
	lt(value: string): Filter;
	lessThanOrEqual(value: string): Filter;
	le(value: string): Filter;
	greaterThan(value: string): Filter;
	gt(value: string): Filter;
	greaterThanOrEqual(value: string): Filter;
	ge(value: string): Filter;
	between(from: string, to: string): Filter;
	in(values: Array<string | null>): Filter;
}

interface BinaryColumnType {
	equal(value: string | null): Filter;
	eq(value: string): Filter;
	notEqual(value: string | null): Filter	
	ne(value: string): Filter	
	lessThan(value: string): Filter;
	lt(value: string): Filter;
	lessThanOrEqual(value: string): Filter;
	le(value: string): Filter;
	greaterThan(value: string): Filter;
	gt(value: string): Filter;
	greaterThanOrEqual(value: string): Filter;
	ge(value: string): Filter;
	between(from: string, to: string): Filter;
	in(values: Array<string | null>): Filter;
}

interface BooleanColumnType {
	equal(value: boolean | null): Filter;
	eq(value: boolean): Filter;
	notEqual(value: boolean | null): Filter	
	ne(value: boolean): Filter	
	lessThan(value: boolean): Filter;
	lt(value: boolean): Filter;
	lessThanOrEqual(value: boolean): Filter;
	le(value: boolean): Filter;
	greaterThan(value: boolean): Filter;
	gt(value: boolean): Filter;
	greaterThanOrEqual(value: boolean): Filter;
	ge(value: boolean): Filter;
	between(from: boolean, to: boolean): Filter;
	in(values: Array<boolean | null>): Filter;
}

interface DateColumnType {
	equal(value: string | Date | null): Filter;
	eq(value: string | Date): Filter;
	notEqual(value: string | Date | null): Filter	
	ne(value: string | Date): Filter	
	lessThan(value: string | Date): Filter;
	lt(value: string | Date): Filter;
	lessThanOrEqual(value: string | Date): Filter;
	le(value: string | Date): Filter;
	greaterThan(value: string | Date): Filter;
	gt(value: string | Date): Filter;
	greaterThanOrEqual(value: string | Date): Filter;
	ge(value: string | Date): Filter;
	between(from: string | Date, to: string | Date): Filter;
	in(values: Array<string | Date | null>): Filter;
}

interface StringColumnType {
	equal(value: string | null): Filter;
	eq(value: string): Filter;
	notEqual(value: string | null): Filter	
	ne(value: string): Filter	
	lessThan(value: string): Filter;
	lt(value: string): Filter;
	lessThanOrEqual(value: string): Filter;
	le(value: string): Filter;
	greaterThan(value: string): Filter;
	gt(value: string): Filter;
	greaterThanOrEqual(value: string): Filter;
	ge(value: string): Filter;
	between(from: string, to: string): Filter;
	in(values: Array<string | null>): Filter;
	
	startsWith(value: string): Filter;
	endsWith(value: string): Filter;
	contains(value: string): Filter;
	iStartsWith(value: string): Filter;
	iEndsWith(value: string): Filter;
	iContains(value: string): Filter;
	iEqual(value: string | null): Filter;
	ieq(value: string | null): Filter;
}

interface NumericColumnType {
	equal(value: number | null): Filter;
	eq(value: number): Filter;
	notEqual(value: number | null): Filter	
	ne(value: number): Filter	
	lessThan(value: number): Filter;
	lt(value: number): Filter;
	lessThanOrEqual(value: number): Filter;
	le(value: number): Filter;
	greaterThan(value: number): Filter;
	gt(value: number): Filter;
	greaterThanOrEqual(value: number): Filter;
	ge(value: number): Filter;
	between(from: number, to: number): Filter;
	in(values: Array<number | null>): Filter;
}

interface JSONColumnType {
	equal(value: object | null): Filter;
	eq(value: object): Filter;
	notEqual(value: object | null): Filter	
	ne(value: object): Filter	
	lessThan(value: object): Filter;
	lt(value: object): Filter;
	lessThanOrEqual(value: object): Filter;
	le(value: object): Filter;
	greaterThan(value: object): Filter;
	gt(value: object): Filter;
	greaterThanOrEqual(value: object): Filter;
	ge(value: object): Filter;
	between(from: object, to: object): Filter;
	in(values: Array<object | null>): Filter;
}

interface ColumnType {
	string: () => StringColumnType;
	uuid: () => UuidColumnType;
	numeric: () => NumericColumnType;
	date: () => DateColumnType;
	binary(): BinaryColumnType;
	boolean(): BooleanColumnType;
	json(): JSONColumnType;
}

interface RawFilter {
	sql: string | (() => string);
	parameters?: any[];
}

interface Filter extends RawFilter {
	and<T extends RawFilter>(otherFilter: T): Filter;
}


type FetchingStrategy<T> = {
	[K in keyof T & keyof RemoveNever<AllowedColumnsAndTables<T>>]?: boolean | FetchingStrategy<T[K]>
} & {
	orderBy?: Array<OrderBy<Extract<keyof AllowedColumns<T>, string>>>;	
	limit?: number;
	offset?: number;
};


 type OrderBy<T extends string> = `${T} ${'asc' | 'desc'}` | T;

type RelatedTable = {};

type ReferenceMapper<TFrom, TTo> = {
	by(foreignKey: keyof TFrom): MappedTable<any, TTo> & RelatedTable;
};

type ColumnMapper<T> = {
	column: (columnName: string) => ColumnType;
	references: <TTo>(mappedTable: MappedTable<any, TTo>) => ReferenceMapper<T, TTo>;
};


type MappedTable<T, U> =  {
	// map:  (<U extends AllowedColumnsAndTables<U>>(callback: (mapper: ColumnMapper<T>) => U) => MappedTable<T, U>) & MappedTable<T,T>;
	getOne: <FS extends FetchingStrategy<U>>(filter: Filter, fetchingStrategy: FS) => StrategyToRow<FetchedProperties<Required<U>, Required<FS>>>;
	map: <V extends AllowedColumnsAndTables<V>>(callback: (mapper: ColumnMapper<U>) => V) => MappedTable<T, U & V>;
  } & U;
  
//   type Table<T> = (<U extends AllowedColumnsAndTables<U>>(callback: (mapper: ColumnMapper<T>) => U) => MappedTable<T, U>) & MappedTable<T,T> & {
//   };


  type Table<T> = {
	map:  (<U extends AllowedColumnsAndTables<U>>(callback: (mapper: ColumnMapper<T>) => U) => MappedTable<T, U>) & MappedTable<T,T>;
  };



type ColumnTypes = StringColumnType | UuidColumnType | NumericColumnType | DateColumnType;
type ColumnAndTableTypes = ColumnTypes | RelatedTable  ;


type StrategyToRow<T> = {
	[K in keyof T as T[K] extends never ? never : K]: T[K] extends StringColumnType
	? string
		:T[K] extends NumericColumnType
		? number
		:T[K] extends UuidColumnType
		? string
		:T[K] extends DateColumnType
		? string
	: StrategyToRow<T[K]>
  };

  type AllowedColumnsAndTables<T> = {
  [P in keyof T]: T[P] extends ColumnAndTableTypes
  	? T[P] 
	:  never;
};

  type AllowedColumns<T> = RemoveNever<{
  [P in keyof T]: T[P] extends ColumnTypes
  	? T[P] 
	:  never;
}>;

type AtLeastOneTrue<T> = {
	[K in keyof T]: T[K] extends true ? true : never;
}[keyof T] extends never ? false : true;

type ExtractColumns<T, TStrategy> = {
	[K in keyof TStrategy]: K extends keyof T
	? T[K] extends StringColumnType | UuidColumnType | NumericColumnType | DateColumnType ? TStrategy[K] : never
	: never
}
	type FetchedProperties<T, TStrategy> = AtLeastOneTrue<RemoveNever<ExtractColumns<T, TStrategy>>> extends true
	? {
		[K in keyof T]: K extends keyof TStrategy
		? TStrategy[K] extends true 
			? T[K] extends StringColumnType | UuidColumnType | NumericColumnType | DateColumnType			
				? T[K]
				: FetchedProperties<Required<T[K]>, {}>		
			: TStrategy[K] extends false
				? never
				: FetchedProperties<Required<T[K]>, Required<TStrategy[K]>>			
		: never
	}
	: {
		[K in keyof T]: K extends keyof TStrategy
		? TStrategy[K] extends true 
			? T[K] extends StringColumnType | UuidColumnType | NumericColumnType | DateColumnType			
				? T[K]
				: FetchedProperties<Required<T[K]>, {}>		
			: TStrategy[K] extends false
				? never
				: FetchedProperties<Required<T[K]>, Required<TStrategy[K]>>			
		: NegotiateDefaultStrategy<T[K]>
	};


type NegotiateDefaultStrategy<T> = T extends StringColumnType | UuidColumnType | NumericColumnType | DateColumnType ? T : never

type RemoveNever<T> = {
	[K in keyof T as T[K] extends never ? never : K]: T[K] extends object ? RemoveNever<T[K]> : T[K]
};

declare const orm: ORM.ORM;
export default orm;
