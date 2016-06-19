var a = require('a');

function act(c){
	c.mock = a.mock;
	c.getChangeSet = a.requireMock('./getChangeSet');
	c.notifyDirty = a.requireMock('../notifyDirty');
	c.negotiateFlush = a.requireMock('./negotiateFlush');
	
	c.changeSet = {};
	c.command = {};
	c.changeSet.push = c.mock();
	c.changeSet.push.expect(c.command);
	c.getChangeSet.expect().return(c.changeSet);

	c.notifyDirty.expect();

	c.negotiateFlush.expect();

	require('../pushCommand')(c.command);
}

module.exports = act;