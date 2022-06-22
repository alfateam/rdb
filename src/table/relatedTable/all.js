let newRelatedTable = _newRelatedTable;
const negotiateRawSqlFilter = require('../column/negotiateRawSqlFilter');
let subFilter = require('./subFilter');
let isShallow = true;

function newAll(relations) {

	function all(fn) {
		let relatedTable = newRelatedTable(relations, isShallow);
		let arg = typeof fn === 'function' ? fn(relatedTable) : fn;
		let anyFilter = negotiateRawSqlFilter(arg);
		let anySubFilter = subFilter(relations, anyFilter);
		let notFilter = subFilter(relations, anyFilter.not()).not();
		return anySubFilter.and(notFilter);
	}
	return all;
}

function _newRelatedTable() {
	newRelatedTable = require('../newRelatedTable');
	return newRelatedTable.apply(null, arguments);
}

module.exports = newAll;