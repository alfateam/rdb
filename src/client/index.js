const createPatch = require('./createPatch');
const stringify = require('./stringify');
const netAdapter = require('./netAdapter');
const toKeyPositionMap = require('./toKeyPositionMap');
const rootMap = new WeakMap();
const targetKey = Symbol();

function rdbClient(options = {}) {
	if (options.pg)
		options = { db: options };
	let beforeResponse = options.beforeResponse;
	let beforeRequest = options.beforeRequest;
	let transaction = options.transaction;
	let _reactive = options.reactive;
	let baseUrl = options.db;
	function client(_options = {}) {
		if (_options.pg)
			_options = { db: _options };
		return rdbClient({ ...options, ..._options });
	}

	if (options.tables) {
		for (let name in options.tables) {
			client[name] = table(options.tables[name]);
		}
		client.tables = options.tables;
	}

	client.Concurrencies = {
		Optimistic: 'optimistic',
		SkipOnConflict: 'skipOnConflict',
		Overwrite: 'overwrite'
	};
	client.beforeResponse = (cb => beforeResponse = cb);
	client.beforeRequest = (cb => beforeRequest = cb);
	client.reactive = (cb => _reactive = cb);
	client.table = table;
	client.or = column('or');
	client.and = column('and');
	client.not = column('not');
	client.filter = {
		or: client.or,
		and: client.and,
		not: client.not,
		toJSON: function() {
			return;
		}
	};
	client.query = query;
	client.transaction = runInTransaction;
	client.db = baseUrl;

	return client;

	async function query() {
		return netAdapter(baseUrl, { tableOptions: { db: baseUrl } }).query.apply(null, arguments);
	}

	async function runInTransaction(fn, _options) {
		let db = baseUrl;
		if (typeof db === 'function') {
			let dbPromise = db();
			if (dbPromise.then)
				db = await dbPromise;
			else
				db = dbPromise;
		}
		if (!db.createTransaction)
			throw new Error('Transaction not supported through http');
		const transaction = db.createTransaction(_options);
		try {
			const nextClient = client({ transaction });
			await fn(nextClient);
			await transaction(db.commit);
		}
		catch (e) {
			await transaction(db.rollback.bind(null, e));
		}
	}

	function table(url, tableOptions) {
		if (baseUrl && typeof url === 'string')
			url = baseUrl + url;
		else if (baseUrl) {
			tableOptions = tableOptions || {};
			tableOptions = { db: baseUrl, ...tableOptions, transaction };
		}
		let meta;
		let c = {
			getManyDto: getMany,
			getMany,
			express,
			getOne: tryGetFirst,
			tryGetFirst,
			tryGetById,
			getById,
			proxify,
			insert,
			insertAndForget,
			delete: _delete,
			cascadeDelete
		};

		let handler = {
			get(_target, property,) {
				if (property in c)
					return Reflect.get(...arguments);
				else
					return column(property);
			}

		};
		let _table = new Proxy(c, handler);
		return _table;

		async function getMany(_, strategy) {
			let metaPromise = getMeta();
			strategy = extractStrategy({ strategy });
			let args = [_, strategy].concat(Array.prototype.slice.call(arguments).slice(2));
			let rows = await getManyCore.apply(null, args);
			await metaPromise;
			return proxify(rows, strategy);
		}

		async function tryGetFirst(filter, strategy) {
			let metaPromise = getMeta();
			strategy = extractStrategy({ strategy });
			let _strategy = { ...strategy, ...{ limit: 1 } };
			let args = [filter, _strategy].concat(Array.prototype.slice.call(arguments).slice(2));
			let rows = await getManyCore.apply(null, args);
			await metaPromise;
			if (rows.length === 0)
				return;
			return proxify(rows[0], strategy);
		}

		async function tryGetById() {
			if (arguments.length === 0)
				return;
			let meta = await getMeta();
			let keyFilter = client.filter;
			for (let i = 0; i < meta.keys.length; i++) {
				let keyName = meta.keys[i].name;
				let keyValue = arguments[i];
				keyFilter = keyFilter.and(_table[keyName].eq(keyValue));
			}
			let args = [keyFilter].concat(Array.prototype.slice.call(arguments).slice(meta.keys.length));
			return tryGetFirst.apply(null, args);
		}

		function express() {
			return netAdapter(url, { beforeRequest, beforeResponse, tableOptions }).express.apply(null, arguments);
		}

		async function getById() {
			let row = await tryGetById.apply(null, arguments);
			if (!row)
				throw new Error('Row not found : ' + arguments);
			return row;
		}

		async function getManyCore() {
			let args = Array.prototype.slice.call(arguments);
			let body = stringify({
				path: 'getManyDto',
				args
			});
			let adapter = netAdapter(url, { beforeRequest, beforeResponse, tableOptions });
			return adapter.post(body);
		}

		async function insertAndForget() {
			let args = Array.prototype.slice.call(arguments);
			let body = stringify({
				path: 'insertAndForget',
				args
			});
			let adapter = netAdapter(url, { beforeRequest, beforeResponse, tableOptions });
			return adapter.post(body);
		}

		async function _delete() {
			let args = Array.prototype.slice.call(arguments);
			let body = stringify({
				path: 'delete',
				args
			});
			let adapter = netAdapter(url, { beforeRequest, beforeResponse, tableOptions });
			return adapter.post(body);
		}

		async function cascadeDelete() {
			let args = Array.prototype.slice.call(arguments);
			let body = stringify({
				path: 'cascadeDelete',
				args
			});
			let adapter = netAdapter(url, { beforeRequest, beforeResponse, tableOptions });
			return adapter.post(body);
		}

		async function insert(rows, ...options) {
			let proxy = proxify(rows);
			return proxy.insert.apply(proxy, options);
		}

		function proxify(itemOrArray, strategy) {
			if (Array.isArray(itemOrArray))
				return proxifyArray(itemOrArray, strategy);
			else
				return proxifyRow(itemOrArray, strategy);
		}

		function proxifyArray(array, strategy) {
			let _array = array;
			if (_reactive)
				array = _reactive(array);
			let handler = {
				get(_target, property) {
					if (property === 'toJSON')
						return () => {
							return toJSON(array);
						};
					else if (property === 'save' || property === 'saveChanges')
						return saveArray.bind(null, array);
					else if (property === 'insert')
						return insertArray.bind(null, array, innerProxy);
					else if (property === 'delete')
						return deleteArray.bind(null, array);
					else if (property === 'refresh')
						return refreshArray.bind(null, array);
					else if (property === 'clearChanges')
						return clearChangesArray.bind(null, array);
					else if (property === 'acceptChanges')
						return acceptChangesArray.bind(null, array);
					else if (property === targetKey)
						return _array;
					else
						return Reflect.get.apply(_array, arguments);
				}

			};
			let innerProxy = new Proxy(array, handler);
			rootMap.set(array, { json: stringify(array), strategy });
			return innerProxy;
		}

		function proxifyRow(row, strategy) {
			// let enabled = false;
			let handler = {
				get(_target, property,) {
					if (property === 'save' || property === 'saveChanges') //call server then acceptChanges
						return saveRow.bind(null, row);
					else if (property === 'insert') //call server then remove from jsonMap and add to original
						return insertRow.bind(null, row, innerProxy);
					else if (property === 'delete') //call server then remove from jsonMap and original
						return deleteRow.bind(null, row);
					else if (property === 'refresh') //refresh from server then acceptChanges
						return refreshRow.bind(null, row);
					else if (property === 'clearChanges') //refresh from jsonMap, update original if present
						return clearChangesRow.bind(null, row);
					else if (property === 'acceptChanges') //remove from jsonMap
						return acceptChangesRow.bind(null, row);
					else if (property === 'toJSON')
						return () => {
							return toJSON(row);
						};
					else if (property === targetKey)
						return row;
					else
						return Reflect.get(...arguments);
				}

			};
			let innerProxy = new Proxy(row, handler);
			rootMap.set(row, { json: stringify(row), strategy });
			return innerProxy;
		}

		function toJSON(row, _meta = meta) {
			if (!_meta)
				return row;
			if (Array.isArray(row)) {
				return row.map(x => toJSON(x, _meta));
			}
			let result = {};
			for (let name in row) {
				if (name in _meta.relations)
					result[name] = toJSON(row[name], _meta.relations[name]);
				else if (name in _meta.columns) {
					if (_meta.columns[name].serializable)
						result[name] = row[name];
				}
				else
					result[name] = row[name];
			}
			return result;
		}

		async function getMeta() {
			if (meta)
				return meta;
			let adapter = netAdapter(url, { beforeRequest, beforeResponse, tableOptions });
			meta = await adapter.get();

			while (hasUnresolved(meta)) {
				meta = parseMeta(meta);
			}
			return meta;

			function parseMeta(meta, map = new Map()) {
				if (typeof meta === 'number') {
					return map.get(meta) || meta;
				}
				map.set(meta.id, meta);
				for (let p in meta.relations) {
					meta.relations[p] = parseMeta(meta.relations[p], map);
				}
				return meta;
			}

			function hasUnresolved(meta, set = new WeakSet()) {
				if (typeof meta === 'number')
					return true;
				else if (set.has(meta))
					return false;
				else {
					set.add(meta);
					return Object.values(meta.relations).reduce((prev, current) => {
						return prev || hasUnresolved(current, set);
					}, false);
				}
			}


		}

		async function saveArray(array, options) {
			let { json } = rootMap.get(array);
			let strategy = extractStrategy(options, array);
			let meta = await getMeta();
			const patch = createPatch(JSON.parse(json), array, meta);
			if (patch.length === 0)
				return;
			let body = stringify({ patch, options: { strategy, ...options } });
			let adapter = netAdapter(url, { beforeRequest, beforeResponse, tableOptions });
			let p = adapter.patch(body);
			let affectedRows = extractChangedRows(array, patch, meta);
			let { changed } = await p;
			copyInto(changed, affectedRows);
			rootMap.set(array, { json: stringify(array), strategy });
		}

		function extractChangedRows(rows, patch, meta) {
			const keyPositionMap = toKeyPositionMap(rows, meta);
			const affectedRowsSet = new Set();
			for (let i = 0; i < patch.length; i++) {
				const element = patch[i];
				const pathArray = element.path.split('/');
				const position = keyPositionMap[pathArray[1]];
				if (position >= 0)
					affectedRowsSet.add(rows[position]);
			}
			return [...affectedRowsSet];
		}
		function copyInto(from, to) {
			for (let i = 0; i < from.length; i++) {
				for (let p in from[i]) {
					to[i][p] = from[i][p];
				}
			}
		}

		function extractStrategy(options, obj) {
			if (options && 'strategy' in options)
				return options.strategy;
			if (obj) {
				let context = rootMap.get(obj);
				if (context.strategy !== undefined) {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					let { limit, ...strategy } = context.strategy;
					return strategy;
				}
			}
			if (tableOptions)
				return tableOptions.strategy;
		}



		function clearChangesArray(array) {
			let { json } = rootMap.get(array);
			array.splice(0, array.length, JSON.parse(json));
		}

		function acceptChangesArray(array) {
			rootMap.set(array, { jsonMap: new Map(), original: new Set(array) });
		}

		async function insertArray(array, proxy, options) {
			if (array.length === 0)
				return;
			let strategy = extractStrategy(options);
			let meta = await getMeta();
			let patch = createPatch([], array, meta);

			let body = stringify({ patch, options: { strategy, ...options } });
			let adapter = netAdapter(url, { beforeRequest, beforeResponse, tableOptions });
			let { changed } = await adapter.patch(body);
			copyInto(changed, array);
			rootMap.set(array, { json: stringify(array), strategy });
			return proxy;
		}

		async function deleteArray(array, options) {
			if (array.length === 0)
				return;
			let meta = await getMeta();
			let patch = createPatch(array, [], meta);
			let body = stringify({ patch, options });
			let adapter = netAdapter(url, { beforeRequest, beforeResponse, tableOptions });
			await adapter.patch(body);
			let strategy = rootMap.get(array).strategy;
			array.length = 0;
			rootMap.set(array, { jsonMap: stringify(array), strategy });
		}

		function setMapValue(rowsMap, keys, row, index) {
			let keyValue = row[keys[0].name];
			if (keys.length > 1) {
				let subMap = rowsMap.get(keyValue);
				if (!subMap) {
					subMap = new Map();
					rowsMap.set(keyValue, subMap);
				}
				setMapValue(subMap, keys.slice(1), row, index);
			}
			else
				rowsMap.set(keyValue, index);
		}

		function getMapValue(rowsMap, keys, row) {
			let keyValue = row[keys[0].name];
			if (keys.length > 1)
				return getMapValue(rowsMap.get(keyValue), keys.slice(1));
			else
				return rowsMap.get(keyValue);
		}

		async function refreshArray(array, options) {
			let strategy = extractStrategy(options);
			if (array.length === 0)
				return;
			let meta = await getMeta();
			let filter = client.filter;
			let rowsMap = new Map();
			for (let rowIndex = 0; rowIndex < array.length; rowIndex++) {
				let row = array[rowIndex];
				let keyFilter = client.filter;
				for (let i = 0; i < meta.keys.length; i++) {
					let keyName = meta.keys[i].name;
					let keyValue = row[keyName];
					keyFilter = keyFilter.and(_table[keyName].eq(keyValue));
				}
				setMapValue(rowsMap, meta.keys, row, rowIndex);
				filter = filter.or(keyFilter);
			}
			let rows = await getManyCore(filter, strategy);
			let removedIndexes = new Set();
			if (array.length !== rows.length)
				for (var i = 0; i < array.length; i++) {
					removedIndexes.add(i);
				}
			for (let i = 0; i < rows.length; i++) {
				let row = rows[i];
				let originalIndex = getMapValue(rowsMap, meta.keys, row);
				if (array.length !== rows.length)
					removedIndexes.delete(originalIndex);
				array[originalIndex] = row;
			}
			let offset = 0;
			for (let i of removedIndexes) {
				array.splice(i + offset, 1);
				offset--;
			}
			rootMap.set(array, { json: stringify(array), strategy });
		}

		async function insertRow(row, innerProxy, options) {
			let strategy = extractStrategy(options, row);
			let meta = await getMeta();
			let patch = createPatch([], [row], meta);
			let body = stringify({ patch, options: { strategy, ...options } });

			let adapter = netAdapter(url, { beforeRequest, beforeResponse, tableOptions });
			let { changed } = await adapter.patch(body);
			copyInto(changed, [row]);
			rootMap.set(row, { json: stringify(row), strategy });

			return innerProxy;
		}

		async function deleteRow(row, options) {
			let strategy = extractStrategy(options, row);
			let meta = await getMeta();
			let patch = createPatch([row], [], meta);
			let body = stringify({ patch, options });

			let adapter = netAdapter(url, { beforeRequest, beforeResponse, tableOptions });
			await adapter.patch(body);
			rootMap.set(row, { strategy });
		}

		async function saveRow(row, options) {
			let strategy = extractStrategy(options, row);
			let { json } = rootMap.get(row);
			if (!json)
				return;
			let meta = await getMeta();

			let patch = createPatch([JSON.parse(json)], [row], meta);
			if (patch.length === 0)
				return;

			let body = stringify({ patch, options: { ...options, strategy } });

			let adapter = netAdapter(url, { beforeRequest, beforeResponse, tableOptions });
			let { changed } = await adapter.patch(body);
			copyInto(changed, [row]);
			rootMap.set(row, { json: stringify(row), strategy });
		}

		async function refreshRow(row, options) {
			let strategy = extractStrategy(options, row);
			let meta = await getMeta();
			let keyFilter = client.filter;
			for (let i = 0; i < meta.keys.length; i++) {
				let keyName = meta.keys[i].name;
				let keyValue = row[keyName];
				keyFilter = keyFilter.and(_table[keyName].eq(keyValue));
			}
			let rows = await getManyCore.apply(keyFilter, strategy);
			for (let p in row) {
				delete row[p];
			}
			if (rows.length === 0)
				return;
			for (let p in rows[0]) {
				row[p] = rows[0][p];
			}
			rootMap.set(row, { json: stringify(row), strategy });
		}

		function acceptChangesRow(row) {
			rootMap.set(row, {});
		}

		function clearChangesRow(row) {
			let { json } = rootMap.get(row);
			if (!json)
				return;
			let old = JSON.parse(json);
			for (let p in row) {
				delete row[p];
			}
			for (let p in old) {
				row[p] = old[p];
			}
			rootMap.set(row, {});
		}

	}
}

function tableProxy() {
	let handler = {
		get(_target, property,) {
			return column(property);
		}

	};
	return new Proxy({}, handler);
}


function column(path, ...previous) {
	function c() {
		let args = [];
		for (let i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] === 'function')
				args[i] = arguments[i](tableProxy(path.split('.').slice(0, -1).join('.')));
			else
				args[i] = arguments[i];
		}
		args = previous.concat(Array.prototype.slice.call(args));
		let result = { path, args };
		let handler = {
			get(_target, property) {
				if (property === 'toJSON')
					return result.toJSON;
				if (property in result)
					return Reflect.get(...arguments);
				else
					return column(property, result);

			}
		};
		return new Proxy(result, handler);
	}
	let handler = {
		get(_target, property) {
			if (property === 'toJSON')
				return Reflect.get(...arguments);
			else
				return column(path + '.' + property);
		}

	};
	return new Proxy(c, handler);

}

module.exports = rdbClient();