import pauseFn from '.';
import test from 'tape';

let i = 0;

function fn(...args) {
	for (const arg of args) {
		i += arg;
	}

	return i;
}

const paused = pauseFn(fn);

test('pauseFn()', async t => {
	t.equal(
		paused(1),
		undefined,
		'should let the passed function return `undefined`.'
	);

	t.equal(
		i,
		0,
		'should let the passed function do nothing.'
	);

	t.equal(
		paused(2, 3),
		undefined,
		'should support multiple arguments.'
	);

	t.throws(
		() => pauseFn(-0),
		/^TypeError: Expected a <Function>, but got a non-function value -0 \(number\)\./u,
		'should throw an error when it takes a non-function value.'
	);

	t.throws(
		() => pauseFn(paused),
		/^Error: Expected a <Function> which hasn't been paused by `pauseFn\(\)`, but got an already paused one \[Function: paused\]\./u,
		'should throw an error when it takes an already paused function.'
	);

	t.throws(
		() => pauseFn(),
		/^RangeError: Expected 1 argument \(<Function>\), but got no arguments\./u,
		'should throw an error when it takes no arguments.'
	);

	t.throws(
		() => pauseFn(fn, fn),
		/^RangeError: Expected 1 argument \(<Function>\), but got 2 arguments\./u,
		'should throw an error when it takes too many arguments.'
	);

	t.end();
});

test('pauseFn.resume()', async t => {
	t.deepEqual(
		pauseFn.resume(paused),
		[1, 6],
		'should return buffered values.'
	);

	t.equal(
		paused(4),
		10,
		'should run buffered operations.'
	);

	t.throws(
		() => pauseFn.resume(new Int8Array()),
		/^TypeError: Expected a <Function> returned by `pauseFn\(\)`, but got a non-function value Int8Array \[\]\./u,
		'should throw an error when it takes a non-function value.'
	);

	t.throws(
		() => pauseFn.resume(paused),
		/^TypeError: Expected a <Function> returned by `pauseFn\(\)`, but got an already resume\(\)-ed one .*\./u,
		'should throw an error when it takes a function that\'s already resumed.'
	);

	t.throws(
		() => pauseFn.resume(t.fail),
		/^TypeError: Expected a <Function> returned by `pauseFn\(\)`, but got .* which is not returned by `pauseFn\(\)`\./u,
		'should throw an error when it takes a function that hasn\'t been paused.'
	);

	t.throws(
		() => pauseFn.resume(),
		/^RangeError: Expected 1 argument \(<Function>\), but got no arguments\./u,
		'should throw an error when it takes no arguments.'
	);

	t.throws(
		() => pauseFn.resume(t.fail, t.fail),
		/^RangeError: Expected 1 argument \(<Function>\), but got 2 arguments\./u,
		'should throw an error when it takes too many arguments.'
	);

	t.end();
});

test('pauseFn.pause()', async t => {
	t.equal(
		pauseFn.pause,
		pauseFn,
		'should be an alias of `parseFn()`.'
	);

	t.end();
});
