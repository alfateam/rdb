var q1 = {};
var q2 = {};
var queries = [q1,q2];
var a  = require('a');
var mock = a.mock;
var requireMock  = a.requireMock;
var executeQuery = requireMock('./executeQueries/executeQuery');
var promise = requireMock('../promise');
var resultPromise1 = {};
var resultPromise2 = {};

function act(c){	
	c.expected = {};
	executeQuery.expect(q1).return(resultPromise1);
	executeQuery.expect(q2).return(resultPromise2);

	promise.all = mock();
	promise.all.expect([q1,q2]).return(c.expected);
	c.returned = require('../executeQueries')(queries);
}


module.exports = act;