Base Ts Result
===========
Better error handling stolen from rust

<!-- shields -->

![npm](https://img.shields.io/npm/v/base-ts-result)
![npm](https://img.shields.io/npm/dm/base-ts-result)
![NPM](https://img.shields.io/npm/l/base-ts-result)

* [Install](#Install)
* [Example](#Example)
* [Overview](#Overview)
    * [Constructors](###Constructors)
    * [Result](###Result)
    * [AsyncResult](###AsyncResult)
    * [Helpers](###Helpers)
* [Sources](#Sources)

## Install
```
npm i base-ts-result
yarn add base-ts-result
pnpm add base-ts-result
```

## Example
```ts
import { 
    Ok, 
    Err, 
    Result, 
    toResult, 
    AsyncResult, 
    toAsyncResult, 
    resultify, 
    type ResultBaseError
} from 'base-ts-result';

const generateNumber = (): Result<number, string> => {
    const num = Math.round(Math.random() * 100);

    if (num > 50) {
        // return ok result
        return Ok(num);
    }

    // return error result
    return Err('Number below 50');
};

const getResult = () => {
    let res: Result<number, Error>;
    
    // res.isErr() = true;
    res = toResult(() => {
        throw new Error('like to throw exceptions');
    });

    // res.isErr() = false;
    res = toResult(() => {
        return 7;
    });
};

const newGetResult = () => {
    const fnThatThrows = (val: number) => {
        if (val == 1) {
            throw new Error(`Are ya kidding me?`);
        }

        return val;
    };

    // now it will return Result<number, BaseError>
    const getNumber = resultify(fnThatThrows);
    const res = getNumber(2);

    // output
    console.log(res.ok()); // 2
    console.log(res.err()); // undefined
}

const handleResult = (res: Result<number, string>) => {
    // Result is OK
    // ===============
    res.ok(); // 15
    res.unwrap(); // 15
    res.unwrapOr(-1); // 15
    res.expect('Custom exception msg'); // 15
    res.err(); // undefined
    res.unwrapErr(); // Exception: tried to get value as error from Ok result

    // Result is ERR
    // ===============
    res.unwrap(); // Exception: Unwrap error Result
    res.unwrapOr(-1); // -1
    res.expect('Custom exception msg'); // Exception: Custom exception msg
    res.err(); // Error object
    res.unwrapErr(); // Error object

    // If you want to handle the error in higher function, 
    // just return the res 
    // ==================================================
    if (res.isErr()) {
        return res;
    }

    // some regular logic..
    return Ok('success handle result');
}

const getAsyncResult = async() => {
    // imitating promise with success result
    function timer<T>(val: T): Promise<T> {
        return new Promise(res => {
            setTimeout(() => {
                res(val);
            }, 100);
        });
    }

    let res: AsyncResult<number, ResultBaseError>;

    const timerPromise = timer(2);
    const errTimerPromise = errTimer();

    // res.isError = false; res.unwrap = 2;
    res = toAsyncResult(timerPromise);

    // res.isError = true;
    res = toAsyncResult(errTimerPromise);
}


const getAsyncResult2 = async() => {
    // imitating promise with success result
    function asyncFn(val: T): ResultPromise<T, Error> {
        return Promise.resolve(Ok(val));
    }

    // for one function call
    const res = await asyncFn(2);
    const val = res.unwrap(); // 2

    // for many function calls
    const fn = createAsyncResult(asyncFn);
    const val1 = await fn(2).unwrap();
    const val2 = await fn(3).unwrap();
    const val3 = await fn(4).unwrap();
}
```

## Overview

### Constructors
Handy functions to create Result objects

```ts
// create success Result
function Ok<Val>(res: Val): OK<Val>;

// create error Result
function Err<Err>(err: Err): ERR<Err>;
```

### Result
Interface that contains operation result and interaction methods
``` ts
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

// Result implementations
class OK implements Result;
class ERR implements Result;
```

### AsyncResult
Class that contains operation result and interaction methods for async code
``` ts
type AsyncMapped<T> = T|Promise<T>
type ResultPromise<T, E> = Promise<Result<T, E>>
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
```ts
// Convert exceptions into errors & function result into Ok
function toResult<Val, ERR>(fn: () => Val): Result<Val, ERR>;

// Returns new function with Result output, has an optional error mapper
function resultify<T, P, E>(fn(...params: P) => T, mapErr?: (err: ResultBaseErr) => E): (...params: P) => Result<T, E>;

// Async version of resultify
function asyncResultify<T, P, E = ResultBaseErr>(fn(...params: P) => T, mapErr?: (err: ResultBaseErr) => E): (...params: P) => AsyncResult<T, E>;

// Create function returning AsyncResult instead of ResultPromise, convenient for multiple results
function createAsyncResultFn<T, P, E>(
    fn: (...params: P) => ResultPromise<T, E>
): (...params: P) => AsyncResult<T, E>;
```

## Sources
- [:package: this package on npm](https://www.npmjs.com/package/base-ts-result)
- [:octocat: this package on github](https://github.com/Kostayne/base-ts-result)
