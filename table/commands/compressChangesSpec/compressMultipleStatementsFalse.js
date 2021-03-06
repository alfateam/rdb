var a  = require('a');
var mock = a.mock;
var requireMock  = a.requireMock;

function act(c){		
	c.requireMock = a.requireMock;
	c.newParameterized = c.requireMock('../query/newParameterized');
	c.getSessionSingleton = c.requireMock('../getSessionSingleton');
	c.getSessionSingleton.expect('multipleStatements').return(false);
	
	c.queries = [c.q1, c.q2];
	c.expected = [c.q1, c.q2];

	c.returned = require('../compressChanges')(c.queries);
}


module.exports = act;