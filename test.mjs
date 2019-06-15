import {strict as assert} from 'assert';

import pauseFn from '.';
import test from 'testit';

let i = 0;

function fn(...args) {
	for (const arg of args) {
		i += arg;
	}

	return i;
}

const paused = pauseFn(fn);

test('puseFn()', () => {
	test('let the passed function return `undefined`', () => {
		assert.equal(paused(1), undefined);
	});

	test('let the passed function do nothing', () => {
		assert.equal(i, 0);
	});

	test('support multiple arguments', () => {
		assert.equal(paused(2, 3), undefined);
	});

	test('throw an error when it takes a non-function value', () => {
		assert.throws(() => pauseFn(-0), {
			name: 'TypeError',
			message: 'Expected a <Function>, but got a non-function value -0 (number).'
		});
	});

	test('throw an error when it takes an already paused function', () => {
		assert.throws(() => pauseFn(paused), {
			name: 'Error',
			message: 'Expected a <Function> which hasn\'t been paused by `pauseFn()`, but got an already paused one [Function: paused].'
		});
	});

	test('throw an error when it takes no arguments', () => {
		assert.throws(() => pauseFn(), {
			name: 'RangeError',
			message: 'Expected 1 argument (<Function>), but got no arguments.'
		});
	});

	test('throw an error when it takes too many arguments', () => {
		assert.throws(() => pauseFn(assert, assert), {
			name: 'RangeError',
			message: 'Expected 1 argument (<Function>), but got 2 arguments.'
		});
	});

	test('has an alias puseFn.pause()', () => {
		assert.equal(pauseFn.pause, pauseFn);
	});
});

test('pauseFn.resume()', () => {
	test('return buffered values', () => {
		assert.deepEqual(pauseFn.resume(paused), [1, 6]);
	});

	test('restore the functionality of the previously paused function', () => {
		assert.equal(paused(4), 10);
	});

	test('throw an error when it takes a non-function value', () => {
		assert.throws(() => pauseFn.resume(new Int8Array()), {
			name: 'TypeError',
			message: 'Expected a <Function> returned by `pauseFn()`, but got a non-function value Int8Array [].'
		});
	});

	test('throw an error when it takes a non-function value', () => {
		assert.throws(() => pauseFn.resume(paused), {
			name: 'TypeError',
			message: /^Expected a <Function> returned by `pauseFn\(\)`, but got an already resume\(\)-ed one .*\./u
		});
	});

	test('throw an error when it takes a function that hasn\'t been paused', () => {
		assert.throws(() => pauseFn.resume(assert), {
			name: 'TypeError',
			message: /^Expected a <Function> returned by `pauseFn\(\)`, but got .* which is not returned by `pauseFn\(\)`\./u
		});
	});

	test('throw an error when it takes no arguments', () => {
		assert.throws(() => pauseFn.resume(), {
			name: 'RangeError',
			message: 'Expected 1 argument (<Function>), but got no arguments.'
		});
	});

	test('throw an error when it takes too many arguments', () => {
		assert.throws(() => pauseFn.resume(assert, assert), {
			name: 'RangeError',
			message: 'Expected 1 argument (<Function>), but got 2 arguments.'
		});
	});
});
