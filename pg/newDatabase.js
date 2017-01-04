var createDomain = require('../createDomain');
var newTransaction = require('./newTransaction');
var promise = require('../table/promise');
var begin = require('../table/begin');
var commit = require('../table/commit');
var rollback = require('../table/rollback');
var newPool = require('./newPool');
var lock = require('../lock');

function newDatabase(connectionString, poolOptions) {
    var pool = newPool(connectionString, poolOptions);
    var c = {};

    c.transaction = function() {
        var domain = createDomain();

        return domain.run(onRun);

        function onRun() {
            var transaction = newTransaction(domain, pool);
            var p = promise(transaction).then(begin);
            return p;
        }
    };

    c.rollback = rollback;
    c.commit = commit;
    c.lock = lock;

    c.end = function() {
        return pool.end();
    };

    c.accept = function(caller) {
        caller.visitPg();
    };

    return c;
}

module.exports = newDatabase;