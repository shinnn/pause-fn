'use strict';

var inspect = require('util').inspect;

var appendType = require('append-type');

var PAUSE_ERROR = 'Expected a <Function> returned by `pauseFn()`';
var resumed = new WeakSet();

module.exports = function pauseFn(fn) {
	if (typeof fn !== 'function') {
		var error = new TypeError('Expected a <Function>, but got a non-function value ' + appendType(fn) + '.');
		error.code = 'ERR_INVALID_ARG_TYPE';

		throw error;
	}

	function paused() {
		if (paused.internalProperties) {
			paused.internalProperties.bufferedArgs.push(arguments);
			return undefined;
		}

		return fn.apply(null, arguments);
	}

	Object.defineProperty(paused, 'internalProperties', {
		configurable: true,
		value: {
			original: fn,
			bufferedArgs: []
		}
	});
	resumed.delete(paused);

	return paused;
};

Object.defineProperty(module.exports, 'pause', {
	enumerable: true,
	value: module.exports
});

Object.defineProperty(module.exports, 'resume', {
	enumerable: true,
	value: function resume(paused) {
		if (typeof paused !== 'function') {
			var error0 = new TypeError(PAUSE_ERROR + ', but got a non-function value ' + appendType(paused) + '.');
			error0.code = 'ERR_INVALID_ARG_TYPE';

			throw error0;
		}

		if (resumed.has(paused)) {
			var error1 = new TypeError(PAUSE_ERROR + ', but got an already resume()-ed one ' + inspect(paused, {breakLength: Infinity}) + '.');
			error1.code = 'ERR_INVALID_ARG_VALUE';

			throw error1;
		}

		if (!paused.internalProperties) {
			var error2 = new TypeError(PAUSE_ERROR + ', but got ' + inspect(paused, {breakLength: Infinity}) + ' which is not returned by `pauseFn()`.');
			error2.code = 'ERR_INVALID_ARG_VALUE';

			throw error2;
		}

		var returnValues = paused.internalProperties.bufferedArgs.map(function(args) {
			return paused.internalProperties.original.apply(null, args);
		});

		delete paused.internalProperties;
		resumed.add(paused);

		return returnValues;
	}
});
