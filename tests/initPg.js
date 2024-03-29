const sql = `
drop schema if exists public cascade;
create schema public;

CREATE TABLE datetest (
    id SERIAL	 PRIMARY KEY,
    tdate DATE,
    tdatetime TIMESTAMP,
    tdatetime_tz TIMESTAMP WITH TIME ZONE
);

INSERT INTO datetest (tdate, tdatetime, tdatetime_tz)
VALUES ('2023-07-14 12:00:00+09:00', '2023-07-14 12:00:00+09:00', '2023-07-14 12:00:00-08:00');

CREATE TABLE customer (
    id SERIAL	 PRIMARY KEY,
    name TEXT,
    balance NUMERIC,
    isActive BOOLEAN,
    data JSONB,
    picture BYTEA
);

CREATE TABLE vendor (
    id NUMERIC PRIMARY KEY,
    name TEXT,
    balance NUMERIC,
    isActive BOOLEAN    
);

CREATE TABLE torder (
    id SERIAL PRIMARY KEY,
    orderDate TIMESTAMP,
    customerId INTEGER REFERENCES customer
);

CREATE TABLE orderLine (
    id SERIAL PRIMARY KEY,
    orderId INTEGER REFERENCES torder,
    product TEXT
);

CREATE TABLE package (
    packageId SERIAL PRIMARY KEY,
    lineId INTEGER REFERENCES orderLine,
    sscc TEXT
);

CREATE TABLE deliveryAddress (
    id SERIAL PRIMARY KEY,
    orderId INTEGER REFERENCES torder,
    name TEXT, 
    street TEXT,
    postalCode TEXT,
    postalPlace TEXT,
    countryCode TEXT
)

`;

module.exports = async function(db) {
	const statements = sql.split(';');
	for (let i = 0; i < statements.length; i++) {
		await db.query(statements[i]);
	}
};