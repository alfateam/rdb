var getChangeSet = require('./commands/getChangeSet');
var compressChanges = require('./commands/compressChanges');

function popChanges() {	
	changeSet = getChangeSet();
	var length = changeSet.length;
	if (length > 0) {
		changeSet[length-1].endEdit();
		var compressed = compressChanges(changeSet);
		changeSet.length = 0;
		return compressed;
	}
	return changeSet;

}

module.exports = popChanges;