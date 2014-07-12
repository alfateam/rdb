var newColumnSql = require('./singleQuery/newColumnSql');
var newJoinSql = require('./singleQuery/newJoinSql');
var newWhereSql = require('./singleQuery/newWhereSql');

function _new(table,filter,span,alias,innerJoin) {
	var c = {};

	c.sql = function() {
		var name = table._dbName;
		var columnSql = newColumnSql(table,span,alias);
		var innerJoinSql = innerJoin.sql();
		var joinSql = newJoinSql(span,alias);
		var whereSql = newWhereSql(table,filter,alias);
		return 'select ' + columnSql + ' from ' + name + ' ' + alias + innerJoinSql + joinSql + whereSql;
	};

	c.parameters = filter.parameters;	
	c.queryContext = {filter: filter, alias: alias, innerJoin: innerJoin};

	return c;
}

module.exports = _new;