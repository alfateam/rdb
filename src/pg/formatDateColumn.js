function formatDateColumn(column, alias) {
	return `${alias}.${column._dbName}::text`;
}

module.exports = formatDateColumn;