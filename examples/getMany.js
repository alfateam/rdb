var fs =require('fs');
var createSql = 'DROP TABLE _order;CREATE TABLE _order (oId uuid PRIMARY KEY, oCustomerId varchar(40), oStatus integer, oTax boolean, oUnits float, oRegDate timestamp with time zone, oSum numeric, oImage bytea);';
createBuffers();
var insertSql = 'DELETE FROM _order;' + 
				'INSERT INTO _order VALUES (\'58d52776-2866-4fbe-8072-cdf13370959b\',\'100\', 1, TRUE, 1.21,\'Fri Mar 07 2014 10:57:07 GMT+01\',1344.23,' + buffer + ');' + 
				'INSERT INTO _order VALUES (\'d51137de-8dd9-4520-a6e0-3a61ddc61a99\',\'200\', 2, FALSE, 2.23,\'Fri Mar 07 2015 08:25:07 GMT+02\',34.59944,' + buffer2 + ')';

var buffer;
var buffer2;

function createBuffers() {
	buffer = newBuffer([1,2,3]);
	buffer2 = newBuffer([4,5]);	

	function newBuffer(contents) {
		var buffer = new Buffer(contents);
		return "E'\\\\x" + buffer.toString('hex') + "'";	
	}
}

var table = require('../table');
var pg = require('pg.js');
var orderTable;
var Domain = require('domain');
var domain = Domain.create();

var dbName = 'test';
var conStringPri = 'postgres://postgres:postgres@localhost/postgres';
var conString = 'postgres://postgres:postgres@localhost/' + dbName;

defineDb();
domain.run(onRun);

function onRun() {
	pg.connect(conString, function(err, client, done) { 
    if (err) {
        console.log('Error while connecting: ' + err);  
        done();
        return;       	    	
    }
	domain.dbClient = client;
    domain.done = done;    
    runDbTest();
	});
}

function runDbTest() {	
 	domain.dbClient.query(createSql + insertSql,onInserted);
}

function onInserted(err, result) {    
    if(err) {
      console.error('error running query', err);
      throw err;
    }    
    getOrders();
 };


function defineDb() {
	defineOrder();
}

function defineOrder() {
	orderTable = table('_order');
	orderTable.primaryColumn('oId').guid().as('id');
	orderTable.column('oCustomerId').string().as('customerId');
	orderTable.column('oStatus').numeric().as('status');
	orderTable.column('oTax').boolean().as('tax');
	orderTable.column('oUnits').numeric().as('units');
	orderTable.column('oRegdate').date().as('regDate');
	orderTable.column('oSum').numeric().as('sum');
	orderTable.column('oImage').binary().as('image');
}		

function getOrders() {
	orderTable.getMany().then(onOrders).done(onOk,onFailed);
}


function getById() {
	return orderTable.getById('58d52776-2866-4fbe-8072-cdf13370959b').then(printRow);		
}

function printRow(row) {
	var image = row.image;
	console.log('id: %s, customerId: %s, status: %s, tax: %s, units: %s, regDate: %s, sum: %s, image: %s',row.id,row.customerId, row.status, row.tax, row.units,row.regDate,row.sum,row.image.toJSON());
}


function onOrders (rows) {	
	console.log('Number of rows: ' + rows.length);
	for (var i in rows) {
		printRow(rows[i]);
	};
}

function onOk() {
	pg = null;	
	domain.done();
}

function onFailed(err) {
	domain.done();
	console.log('failed: ' + err);
	console.log('stack: ' + err.stack);
}