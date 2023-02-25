/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable jest/expect-expect */
import { describe, it, test, beforeAll, expect } from 'vitest'
const rdb = require('rdb');
const _db = require('./db');
const initPg = require('./initPg');
const initMs = require('./initMs');
const initMysql = require('./initMysql');
const initSqlite = require('./initSqlite');
const initSap = require('./initSap');
const dateToISOString = require('../src/dateToISOString');
const versionArray = process.version.replace('v', '').split('.');
const major = parseInt(versionArray[0]);

rdb.log(console.log);

beforeAll(async () => {
	await createMsDemo(mssql());
	// await insertData(pg());
	await insertData(mssql());
	// if (major > 17)
	// 	await insertData(mssqlNative());
	// await insertData(mysql());
	// await insertData(sqlite());
	// await insertData(sap());

	async function insertData({ pool, init }) {
		const db = _db({ db: pool });
		await init(db);

		const george = await db.customer.insert({
			name: 'George',
			balance: 177,
			isActive: true
		});

		const john = await db.customer.insert({
			name: 'John',
			balance: 200,
			isActive: true
		});
		const date1 = new Date(2022, 0, 11, 9, 24, 47);
		const date2 = new Date(2021, 0, 11, 12, 22, 45);

		await db.order.insert([
			{
				orderDate: date1,
				customer: george,
				deliveryAddress: {
					name: 'George',
					street: 'Node street 1',
					postalCode: '7059',
					postalPlace: 'Jakobsli',
					countryCode: 'NO'
				},
				lines: [
					{ product: 'Bicycle' },
					{ product: 'Small guitar' }
				]
			},
			{
				customer: john,
				orderDate: date2,
				deliveryAddress: {
					name: 'Harry Potter',
					street: '4 Privet Drive, Little Whinging',
					postalCode: 'GU4',
					postalPlace: 'Surrey',
					countryCode: 'UK'
				},
				lines: [
					{ product: 'Piano' }
				]
			}
		]);
	}

	async function createMsDemo({ pool }) {
		const db = _db({ db: pool });
		const sql = `IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'demo')
		BEGIN
			CREATE DATABASE demo
		END
		`;
		await db.query(sql);
	}
});


describe('getManyDto', () => {

	// test('pg', async () => await verify(pg()));
	test('mssql', async () => await verify(mssql()));
	// if (major > 17)
	// 	test('mssqlNative', async () => await verify(mssqlNative()));
	// test('mysql', async () => await verify(mysql()));	
	// test('sqlite', async () => await verify(sqlite()));
	// test('sap', async () => await verify(sap()));

	async function verify({ pool }) {
		// _db.default.customer.getMany
		const db = _db({ db: pool });

		const george = await db.customer.getAll();
		console.dir(george)

		const expected = [{
			id: 1,
			name: 'George',
			balance: 177,
			isActive: true
		}, {
			id: 2,
			name: 'John',
			balance: 200,
			isActive: true
		}
		];



		expect([...george]).toEqual(expected);
	}
});

// describe('insert autoincremental with relations', () => {
// 	test('pg', async () => await verify(pg()));
// 	test('mssql', async () => await verify(mssql()));
// 	if (major > 17)
// 		test('mssqlNative', async () => await verify(mssqlNative()));
// 	test('mysql', async () => await verify(mysql()));
// 	test('sqlite', async () => await verify(sqlite()));
// 	test('sap', async () => await verify(sap()));

// 	async function verify({pool, init}) {
// 		const db = _db({ db: pool });
// 		await init(db);

// 		const date1 = new Date(2022, 0, 11, 9, 24, 47);
// 		const date2 = new Date(2021, 0, 11, 12, 22, 45);

// 		const george = await db.customer.insert({
// 			name: 'George',
// 			balance: 177,
// 			isActive: true
// 		});

// 		const john = await db.customer.insert({
// 			name: 'John',
// 			balance: 200,
// 			isActive: true
// 		});

// 		let orders = await db.order.insert([
// 			{
// 				orderDate: date1,
// 				customer: george,
// 				deliveryAddress: {
// 					name: 'George',
// 					street: 'Node street 1',
// 					postalCode: '7059',
// 					postalPlace: 'Jakobsli',
// 					countryCode: 'NO'
// 				},
// 				lines: [
// 					{ product: 'Bicycle' },
// 					{ product: 'Small guitar' }
// 				]
// 			},
// 			{
// 				customer: john,
// 				orderDate: date2,
// 				deliveryAddress: {
// 					name: 'Harry Potter',
// 					street: '4 Privet Drive, Little Whinging',
// 					postalCode: 'GU4',
// 					postalPlace: 'Surrey',
// 					countryCode: 'UK'
// 				},
// 				lines: [
// 					{ product: 'Piano' }
// 				]
// 			}
// 		]);

// 		const expected = [
// 			{
// 				id: 1,
// 				orderDate: dateToISOString(date1),
// 				customerId: 1,
// 				customer: {
// 					id: 1,
// 					name: 'George',
// 					balance: 177,
// 					isActive: true
// 				},
// 				deliveryAddress: {
// 					id: 1,
// 					orderId: 1,
// 					name: 'George',
// 					street: 'Node street 1',
// 					postalCode: '7059',
// 					postalPlace: 'Jakobsli',
// 					countryCode: 'NO'
// 				},
// 				lines: [
// 					{ product: 'Bicycle', id: 1, orderId: 1 },
// 					{ product: 'Small guitar', id: 2, orderId: 1 }
// 				]
// 			},
// 			{
// 				id: 2,
// 				customerId: 2,
// 				customer: {
// 					id: 2,
// 					name: 'John',
// 					balance: 200,
// 					isActive: true
// 				},
// 				orderDate: dateToISOString(date2),
// 				deliveryAddress: {
// 					id: 2,
// 					orderId: 2,
// 					name: 'Harry Potter',
// 					street: '4 Privet Drive, Little Whinging',
// 					postalCode: 'GU4',
// 					postalPlace: 'Surrey',
// 					countryCode: 'UK'
// 				},
// 				lines: [
// 					{ product: 'Piano', id: 3, orderId: 2 }
// 				]
// 			}
// 		];

// 		expect(orders).toEqual(expected);

// 	}

// });

function pg() {
	return { pool: rdb.pg('postgres://postgres:postgres@postgres/postgres'), init: initPg };
}

//eslint-disable-next-line @typescript-eslint/no-unused-vars
function mssqlNative() {
	return { pool: rdb.mssqlNative('server=mssql;Database=demo;Trusted_Connection=No;Uid=sa;pwd=P@assword123;Driver={ODBC Driver 18 for SQL Server};TrustServerCertificate=yes'), init: initMs };
}

function mssql() {
	return {
		pool: rdb.mssql(
			{
				server: 'mssql',
				options: {
					encrypt: false,
					database: 'master'
				},
				authentication: {
					type: 'default',
					options: {
						userName: 'sa',
						password: 'P@assword123',
					}
				}
			}),
		init: initMs
	};
}

function sap() {
	return { pool: rdb.sap(`Driver=${__dirname}/libsybdrvodb.so;SERVER=sapase;Port=5000;UID=sa;PWD=sybase;DATABASE=master`), init: initSap };
}

function mysql() {
	return { pool: rdb.mySql('mysql://test:test@mysql/test'), init: initMysql };
}

function sqlite() {
	return { pool: rdb.sqlite(`demo${new Date().getUTCMilliseconds()}.db`), init: initSqlite };
}