let getSessionContext = require('../../getSessionContext');

function getSqlTemplate(table, row) {
	let columnNames = [];
	let regularColumnNames = [];
	let values = [];
	let sql = 'INSERT INTO ' + table._dbName + ' ';
	addDiscriminators();
	addColumns();
	if (columnNames.length === 0)
		sql += `${defaultValues()}`;
	else
		sql = sql + '('+ columnNames.join(',') + ') ' +  'VALUES (' + values.join(',') + ')';
	return sql;

	function addDiscriminators() {
		let discriminators = table._columnDiscriminators;
		for (let i = 0; i < discriminators.length; i++) {
			let parts = discriminators[i].split('=');
			columnNames.push(parts[0]);
			values.push(parts[1]);
		}
	}

	function addColumns() {
		let columns = table._columns;
		for (let i = 0; i < columns.length; i++) {
			let column = columns[i];
			regularColumnNames.push(column._dbName);
			if (row['__' + column.alias] !== undefined) {
				columnNames.push(column._dbName);
				values.push('%s');
			}
		}
	}

	function defaultValues() {
		let context = getSessionContext();
		let _default = context.insertDefault || 'DEFAULT VALUES';
		return `${_default}`;

	}
}

module.exports = getSqlTemplate;