var when = require('a').when;
var c = {};

when(c).
	it('should create new deleteCommand').assertDoesNotThrow(c.newDeleteCommand.verify);
