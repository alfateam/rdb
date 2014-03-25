var a = require('a');
var mock = a.mock;
var requireMock = a.requireMock;
var expectRequire = a.expectRequire;

function act(c){
	c.mock = mock;
	c.joinRelation = {};
	c.childTable = {};
	c.manyCache = {};
	c.manyCache.tryGet = c.mock();
	c.joinRelation.parentTable = c.childTable;
	c.newForeignKeyFilter = requireMock('./relation/newForeignKeyFilter');
	c.newManyCache = requireMock('./relation/newManyCache');
	c.newManyCache.expect(c.joinRelation).return(c.manyCache);
	c.newManyLeg = requireMock('./relation/newManyLeg');
	c.sut = require('../newManyRelation')(c.joinRelation);
}

module.exports = act;