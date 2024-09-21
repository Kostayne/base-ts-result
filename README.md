Base Ts Result
===========
Better error handling stolen from rust. Return result values instead of throwing exceptions. Handle every error result with minimum nesting.

<!-- shields -->

![npm](https://img.shields.io/npm/v/base-ts-result)
![npm](https://img.shields.io/npm/dm/base-ts-result)
![NPM](https://img.shields.io/npm/l/base-ts-result)

* [Install](#install)
* [Example](#example)
* [Docs](#docs)
    * [Constructors](#constructors)
    * [Result](#result)
    * [AsyncResult](#asyncresult)
    * [Helpers](#helpers)
* [Sources](#Sources)

## Install
```
npm i base-ts-result
yarn add base-ts-result
pnpm add base-ts-result
```

## Example

``` ts
import { Ok, Err, type Result } from 'base-ts-result';

const gonnaThrow = () => {
    throw new Error("you have to catch me or i'll crash the app");
};

const res = toResult(gonnaThrow);
res.isErr() // true

/**
 * @description returns random value, returns error if the value <= 0.5
 */
const getRes = (): Result<number, string> => {
    const val = Math.random();

    if (val > 0.5) {
        return Ok(val);
    }

    return Err('number is too low');
};

/**
 * @description returns random value or zero if random value <= 0.5
 */
const handleRes = () => {
    return getRes()
        .inspect(v => console.log(`Got ok value ${v}`))
        .inspectErr(e => console.error(e))
        .unwrapOr(0);
};

const val = handleRes();
console.log(val);
```

## Docs

### Constructors
Handy functions to create Result objects

```ts
import { Ok, Err } from 'base-ts-result';

// create success Result
const okRes = Ok('success');

// create error Result
const errRes = Err('failure');
```

### Result
Interface that contains operation result and interaction methods

#### Result.unwrap()
Unwraps result value or throws an error if the result is Err.

```ts
import { Ok, Err } from 'base-ts-result';

let res = Ok('great success');
console.log(res.unwrap());

res = Err('fatal error');
res.unwrap(); // throws an error
```

#### Result.unwrapErr()
Unwraps result error or throws an error if the result is Ok.

```ts
import { Ok, Err } from 'base-ts-result';

let res = Ok('great success');
res.unwrapErr(); // throws an error

res = Err('fatal error');
res.unwrapErr(); // return the error
```

#### Result.unwrapOr(altValue)
Unwraps original value or replaces it with provided alternative if the result is Err.

```ts
import { Ok, Err } from 'base-ts-result';

let res = Ok('great success');
console.log(res.unwrapOr('not that great')); // prints great success

res = Err('fatal error');
console.log(res.unwrapOr('not that great')); // prints not that great
```

#### Result.unwrapOrElse(factory: (err: Err))
Unwraps original value if the result is Ok, otherwise returns value from factory function.

```ts
let res = Ok(5);
console.log(res.unwrapOrElse(() => 0)); // prints 5

res = Err('error msg');
console.log(res.unwrapOrElse(() => "not a number")); // prints not a number
```

#### Result.expect(message)
Unwraps result or throws new Error with provided message.

```ts
let res = Ok(5);
console.log(res.expect('provided message')); // 5

res = Err('error msg');
console.log(res.expect('provided message')); // throws an error: 'provided message'
```

#### Result.expectError(message)
Unwraps error from result or throws new Error with provided message.

```ts
let res = Ok(5);
console.log(res.expectErr('provided message')); // Exception: provided message

res = Err('error msg');
console.log(res.expectErr('provided message')); // 'error msg'
```

#### Result.isOk()
Returns true if result is Ok, otherwise returns false.

```ts
let res = Ok(5);
console.log(res.isOk()); // true

res = Err('error msg');
console.log(res.isOk()); // false
```

#### Result.isErr()
Returns true if result is Err, otherwise returns false.

```ts
let res = Ok(5);
console.log(res.isErr()); // false

res = Err('error msg');
console.log(res.isOk()); // true
```

#### Result.ok()
Returns value if result is Ok, or undefined if it's Err.

```ts
let res = Ok(5);
console.log(res.ok()); // 5

res = Err('error msg');
console.log(res.ok()); // undefined
```

#### Result.err()
Returns error value if result is Err, or undefined if it's Ok.

```ts
let res = Ok(5);
console.log(res.err()); // undefined

res = Err('error msg');
console.log(res.err()); // error msg
```

#### Result.map(mapper)
Returns new result with mapped value.

```ts
const res = Ok(5);
const mappedRes = res.map((val) => val + 1);

console.log(mappedRes.unwrap()); // 6
```

#### Result.mapErr(mapper)
Returns new result with mapped error value.

```ts
const res = Err('error msg');
const mappedRes = res.mapErr(err => err + ' suffix');
console.log(mappedRes.unwrapErr()); // error msg suffix
```

#### Result.mapOrElse(mapper, fallback)
Returns new result with mapped ok value & mapped error value.

```ts
const mapOk = (val => val + 1);
const mapErr = (err => err + ' suffix');

console.log(Ok(5).unwrap()) // 6
console.log(Err('error msg').unwrapErr()) // error message suffix
```

#### Result.inspect()
Will run provided inspector if result is Ok.

```ts
let res = Ok(5);
res.inspect((val) => console.log(val)); // prints 5

res = Err('error msg');
res.inspect((val) => console.log(val)); // prints nothing
```

#### Result.inspectErr()
Will run provided inspector if result is Err.

```ts
let res = Ok(5);
res.inspect((val) => console.log(val)); // prints noting

res = Err('error msg');
res.inspect((val) => console.log(val)); // prints error msg
```

#### Result.toAsync()
Returns new async result constructed from current result.

```ts
const res = Ok(5);
const asyncRes = res.toAsync();
```

#### Result interface
```ts
interface Result<Val, Err> {
    // Contained Promise
    value: Val | Err;

    // Queries
    unwrap(): Val;
    unwrapErr(): Err;
    unwrapOr(altVal: Val): Val;
    unwrapOrElse(altValFactory: (err: Err) => Val): Val;
    expect(msg: string): Val;
    expectErr(msg: string): Err;
    isOk(): this is OK<Val>;
    isErr(): this is ERR<Err>;
    ok(): Val|undefined,
    err(): Err|undefined,

    // Mappers
    map<MappedVal>(mapper: (val: Val) => MappedVal): Result<MappedVal, Err>;
    mapOrElse<MappedVal>(mapper: (val: Val) => MappedVal, fallback: (err: Err) => MappedVal): Result<MappedVal, Err>;
    mapErr<MappedErr>(mapper: (err: Err) => MappedErr): Result<Val, MappedErr>;

    // Utilities
    inspect(inspector: (val: Val) => any): Result<Val, Err>;
    inspectErr(inspector: (err: Err) => any): Result<Val, Err>;
    toAsync(): AsyncResult<Val, Err>;
}
```

### AsyncResult
Class that contains operation result and interaction methods for async code

#### Static AsyncResult.fromPromise(promise)
Creates async result from promise.

```ts
import { AsyncResult } from 'base-ts-result';

const resPromise = AsyncResult.fromPromise(Promise.resolve(1));
```

#### Static AsyncResult.fromResult(result)
Creates async result from synchronous result.

```ts
import { AsyncResult } from 'base-ts-result';

const resPromise = AsyncResult.fromResult(Ok(5));
```

#### Static AsyncResult.fromResultPromise(resultPromise)
Creates async result from result promise.

```ts
import { AsyncResult } from 'base-ts-result';

const resPromise = AsyncResult.fromResult(Promise.resolve(Ok(5)));
```

#### AsyncResult interface
``` ts
// Async result implementation for more ergonomic usage of Results with async code
class AsyncResult<Val, Err> {
    // Contained promise
    promise: ResultPromise<Val, Err>; 

    // Creators
    static fromPromise<Val>(promise: Promise<Val>): AsyncResult<Val, unknown>;
    static fromResult<Val, Err>(result: Result<Val, Err>): AsyncResult<Val, Err>;
    static fromResultPromise<Val, Err>(result: ResultPromise<Val, Err>): AsyncResult<Val, Err>;

    // Queries
    async unwrap(): Promise<Val>;
    async unwrapErr(): Promise<Err>;
    async unwrapOr(altVal: Val): Promise<Val>;
    async unwrapOrElse(altValFactory: (err: Err) => AsyncMapped<Val>): Promise<Val>;
    async expect(msg: string): Promise<Val>;
    async expectErr(msg: string): Promise<Err>;
    async isOk(): Promise<boolean>;
    async isErr(): Promise<boolean>;
    async ok(): Promise<Val|undefined>;
    async err(): Promise<Err|undefined>;

    // Mappers
    map<NewVal>(mapper: (val: Val) => AsyncMapped<NewVal>): AsyncResult<NewVal, Err>;

    mapOrElse<NewVal>(
        mapper: (val: Val) => AsyncMapped<NewVal>,
        fallback: (err: Err) => AsyncMapped<NewVal>
    ): AsyncResult<NewVal, Err>;

    mapErr<NewErr>(mapper: (err: Err) => AsyncMapped<NewErr>): AsyncResult<Val, NewErr>;

    // Utilities
    inspect(inspector: (val: Val) => any): AsyncResult<Val, Err>;
    inspectErr(inspector: (err: Err) => any): AsyncResult<Val, Err>;
}
```

### Helpers
#### toResult(fn)
Converts function return value to result.

```ts
import { toResult } from 'base-ts-result';

let res = toResult(() => 2);
console.log(res.unwrap()); // prints 2

res = toResult(() => throw new Err());
console.log(res.unwrapErr()); // prints error
```

#### resultify(fn, mapErr)
Wraps the original function with resultifier.

```ts
const rawFn = (a: number) => {
    if (a < 0) {
        throw new Error('not today')
    }

    return a;
};

const fn = resultify(
    rawFn,
    err => err.message
);

const res = fn(-2); // Result<number, string>
res.err() // 'not today'
```

#### asyncResultify(fn, mapErr)
Converts plain async function to function that return async result.

``` ts
const rawFn = async (a: number) => {
    if (a < 0) {
        throw new Error('not today')
    }

    return a;
};

const fn = asyncResultify(
    rawFn,
    async err => err.message
); // (a: number) => AsyncResult<number, string>

const res = fn(-2); // AsyncResult<number, string>
await res.err() // 'not today'
```

#### createAsyncResult(fn: () => Promise<Result>)
Converts function that returns a promise with sync result into function that returns async result.

```ts
const resultPromiseFn = async (a: number): ResultPromise<number, string> => {
    await new Promise(() => {
        setTimeOut(() => Promise.resolve(), 100)
    });

    if (a < 0) {
        return Err('err');
    }

    return Ok(a);;
};

// Manual, not convenient way
const valueOne = (await resultPromiseFn(2)).unwrap();

// Using helper
const fn = createAsyncResultFn(resultPromiseFn); // (a: number) => AsyncResult<number, string>
const valueTwo = await fn(2).unwrap(); // Same result, with more convenient async handling
```

#### toAsyncResult(promise)
Creates result from a promise.

```ts
const promise = Promise.reject();
const result = toAsyncResult(promise);
```

## Sources
- [:package: this package on npm](https://www.npmjs.com/package/base-ts-result)
- [:octocat: this package on github](https://github.com/Kostayne/base-ts-result)
