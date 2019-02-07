'use strict';

const {inspect} = require('util');

const inspectWithKind = require('inspect-with-kind');

const ARG_ERROR = 'Expected 1 argument (<Function>)';
const PAUSE_ERROR = 'Expected a <Function> returned by `pauseFn()`';
const argsAndOriginalFns = new WeakMap();
const resumed = new WeakSet();

function validateArgumentLength(args) {
	const argLen = args.length;

	if (argLen === 0) {
		const error = new RangeError(`${ARG_ERROR}, but got no arguments.`);

		error.code = 'ERR_MISSING_ARGS';
		Error.captureStackTrace(error, pauseFn);
		throw error;
	}

	if (argLen !== 1) {
		const error = new RangeError(`${ARG_ERROR}, but got ${argLen} arguments.`);

		error.code = 'ERR_TOO_MANY_ARGS';
		Error.captureStackTrace(error, pauseFn);
		throw error;
	}
}

function apply(args) {
	return this(...args);
}

function pauseFn(...args) {
	validateArgumentLength(args);

	const [fn] = args;

	if (typeof fn !== 'function') {
		const error = new TypeError(`Expected a <Function>, but got a non-function value ${inspectWithKind(fn)}.`);
		error.code = 'ERR_INVALID_ARG_TYPE';

		throw error;
	}

	if (argsAndOriginalFns.has(fn)) {
		const error = new Error(`Expected a <Function> which hasn't been paused by \`pauseFn()\`, but got an already paused one ${inspect(fn, {breakLength: Infinity})}.`);
		error.code = 'ERR_INVALID_ARG_VALUE';

		throw error;
	}

	function paused(...fnArgs) {
		if (argsAndOriginalFns.has(paused)) {
			argsAndOriginalFns.get(paused).bufferedArgs.push(fnArgs);
			return undefined;
		}

		return fn(...fnArgs);
	}

	argsAndOriginalFns.set(paused, {
		original: fn,
		bufferedArgs: []
	});
	resumed.delete(paused);

	return paused;
}

module.exports = pauseFn;

Object.defineProperties(module.exports, {
	pause: {
		enumerable: true,
		value: pauseFn
	},
	resume: {
		enumerable: true,
		value: function resume(...args) {
			validateArgumentLength(args);

			const [paused] = args;

			if (typeof paused !== 'function') {
				const error = new TypeError(`${PAUSE_ERROR}, but got a non-function value ${inspectWithKind(paused)}.`);
				error.code = 'ERR_INVALID_ARG_TYPE';

				throw error;
			}

			if (resumed.has(paused)) {
				const error = new TypeError(`${PAUSE_ERROR}, but got an already resume()-ed one ${inspect(paused, {breakLength: Infinity})}.`);
				error.code = 'ERR_INVALID_ARG_VALUE';

				throw error;
			}

			if (!argsAndOriginalFns.has(paused)) {
				const error = new TypeError(`${PAUSE_ERROR}, but got ${inspect(paused, {breakLength: Infinity})} which is not returned by \`pauseFn()\`.`);
				error.code = 'ERR_INVALID_ARG_VALUE';

				throw error;
			}

			const {original, bufferedArgs} = argsAndOriginalFns.get(paused);
			const returnValues = bufferedArgs.map(apply, original);

			argsAndOriginalFns.delete(paused);
			resumed.add(paused);

			return returnValues;
		}
	}
});
