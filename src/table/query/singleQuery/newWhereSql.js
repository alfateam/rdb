var newDiscriminatorSql = require('./newDiscriminatorSql');
var newParameterized = require('../../../table/query/newParameterized');

function newWhereSql(table,filter,alias) {
	var separator = ' where';
	var result = newParameterized('');
	var sql = filter.sql();
	var discriminator = newDiscriminatorSql(table, alias);
	if (sql) {
		result = filter.prepend(separator + ' ');
		separator = ' AND';
	}
	if(discriminator)
		result = result.append(separator + discriminator);

	return result;
}

module.exports = newWhereSql;