let express;

function hostExpress({db, table, defaultConcurrency, concurrency}) {
	let router = express.Router();
	router.patch('/', async function(req, res){
		try {
			let result;
			if (typeof db === 'function') {
				let dbPromise = db();
				if (dbPromise.then)
					db = await dbPromise;
				else
					db = dbPromise;
			}
			await db.transaction(async() => {
				let patch = req.body;
				result = await table.patch(patch, {defaultConcurrency, concurrency});
			});
			res.status(200).json(result);
		}
		catch(e) {
			res.status(500).send(e && e.message);
		}
	});
	return router;
}

module.exports = function hostExpressLazy() {
	if (!express)
		express = require('express');
	return hostExpress.apply(null, arguments);
};