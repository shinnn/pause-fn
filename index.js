'use strict';

const inspect = require('util').inspect;

const appendType = require('append-type');

const PAUSE_ERROR = 'Expected a <Function> returned by `pauseFn()`';
const internalProperties = Symbol('internalProperties');
const resumed = new WeakSet();

function apply(args) {
	return this.apply(null, args);
}

module.exports = function pauseFn(fn) {
	if (typeof fn !== 'function') {
		const error = new TypeError(`Expected a <Function>, but got a non-function value ${appendType(fn)}.`);
		error.code = 'ERR_INVALID_ARG_TYPE';

		throw error;
	}

	function paused() {
		if (paused[internalProperties]) {
			paused[internalProperties].bufferedArgs.push(arguments);
			return undefined;
		}

		return fn.apply(null, arguments);
	}

	Object.defineProperty(paused, internalProperties, {
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
			const error = new TypeError(`${PAUSE_ERROR}, but got a non-function value ${appendType(paused)}.`);
			error.code = 'ERR_INVALID_ARG_TYPE';

			throw error;
		}

		if (resumed.has(paused)) {
			const error = new TypeError(`${PAUSE_ERROR}, but got an already resume()-ed one ${inspect(paused, {breakLength: Infinity})}.`);
			error.code = 'ERR_INVALID_ARG_VALUE';

			throw error;
		}

		if (!paused[internalProperties]) {
			const error = new TypeError(`${PAUSE_ERROR}, but got ${inspect(paused, {breakLength: Infinity})} which is not returned by \`pauseFn()\`.`);
			error.code = 'ERR_INVALID_ARG_VALUE';

			throw error;
		}

		const returnValues = paused[internalProperties].bufferedArgs.map(apply, paused[internalProperties].original);

		delete paused[internalProperties];
		resumed.add(paused);

		return returnValues;
	}
});
