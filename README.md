# pause-fn

[![npm version](https://img.shields.io/npm/v/pause-fn.svg)](https://www.npmjs.com/package/pause-fn)
[![GitHub Actions](https://action-badges.now.sh/shinnn/pause-fn)](https://wdp9fww0r9.execute-api.us-west-2.amazonaws.com/production/results/shinnn/pause-fn)
[![codecov](https://codecov.io/gh/shinnn/pause-fn/branch/master/graph/badge.svg)](https://codecov.io/gh/shinnn/pause-fn)

A [Node.js](https://nodejs.org/) module to pause/resume execution of a function

```javascript
const {pause, resume} = require('pause-fn');
const pausedConsoleLog = pause(console.log);

pausedConsoleLog(1); //=> prints nothing
pausedConsoleLog(2, 3); //=> prints nothing

resume(pausedConsoleLog); //=> prints '1\n' and '2 3\n'
```

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/about-npm/).

```
npm install pause-fn
```

## API

```javascript
const pauseFn = require('pause-fn');
```

### pauseFn(*func*)

*func*: `Function`  
Return: `Function`

It returns a `Function` that does nothing and always returns `undefined`.

```javascript
let num = 0;
const countUp = () => ++num;

countUp(); //=> 1
num; //=> 1

const pausedCountUp = pauseFn(countUp);

pausedCountUp(); //=> undefined, not 2
num; //=> 1, not 2

pausedCountUp(); //=> undefined
pausedCountUp(); //=> undefined
pausedCountUp(); //=> undefined
// ...
num; //=> 1
```

### pauseFn.pause(*func*)

An alias of [`pauseFn()`](#pausefnfunc).

### pauseFn.resume(*func*)

*func*: `Function` returned by [`pauseFn()`](#pausefnfunc)  
Return: `any[]`

It restores the original functionality of the paused `Function`, calls it with the every arguments passed while paused, and returns the return values of each calls as an `Array`.

```javascript
const pausedMathMax = pauseFn(Math.max);

pausedMathMax(0); //=> undefined, not 0
pausedMathMax(Infinity, 1); //=> undefined, not Infinity

// The original function works as usual
Math.max(2, 3); //=> 3

pauseFn.resume(pausedMathMax); //=> [0, Infinity]

// Unlike the variable name, it's no longer paused
pausedMathMax(2, 3); //=> 3
```

## Related

* [pause-methods](https://github.com/shinnn/pause-methods) — pause/resume execution of the object's methods instead of a single function

## License

[ISC License](./LICENSE) © 2019 Watanabe Shinnosuke
