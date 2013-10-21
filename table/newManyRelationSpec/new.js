var a = require('a');
var mock = a.mock;
var requireMock = a.requireMock;
var expectRequire = a.expectRequire;

function act(c){
	c.joinRelation = {};
	c.childTable = {};
	c.joinRelation.parentTable = c.childTable;
	c.newManyLeg = requireMock('./relation/newManyLeg');
	c.sut = require('../newManyRelation')(c.joinRelation);
}

module.exports = act;