var a = require('a');
var mock = a.mock;
var requireMock = a.requireMock;
var expectRequire = a.expectRequire;

function act(c){
	c.mock = mock;
	c.childTable = {};
	c.joinRelation = {};
	c.oneCache = {};
	c.oneCache.tryGet = c.mock();
	c.newForeignKeyFilter = requireMock('./relation/newForeignKeyFilter');
	c.newOneCache = requireMock('./relation/newOneCache');
	c.newOneCache.expect(c.joinRelation).return(c.oneCache);
	c.joinRelation.parentTable = c.childTable;
	c.newLeg = requireMock('./relation/newOneLeg');	
	c.sut = require('../newOneRelation')(c.joinRelation);
}

module.exports = act;