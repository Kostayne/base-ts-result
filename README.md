Base Ts Result
===========
Better error handling stolen from rust

<!-- shields -->

![npm](https://img.shields.io/npm/v/base-ts-result)
![npm](https://img.shields.io/npm/dm/base-ts-result)
![NPM](https://img.shields.io/npm/l/base-ts-result)

* [Install](#Install)
* [Overview](#Overview)
* [Example](#Example)
* [Sources](#Sources)

## Install
```
npm i base-ts-result
yarn add base-ts-result
pnpm add base-ts-result
```

## Overview

### Result
Interface that contains operation result and interaction methods
``` ts
interface Result<Val, Err> {
    value: Val | Err;
    isError: boolean;

    unwrap(): Val;
    unwrapOr(altRes: Val): Val;
    unwrapErr(): Err;

    expect(msg: string): Val;
}

// Result implementations
class OK implements Result;
class ERR implements Result;
```

### Constructors
Handy functions to create Result objects

```ts
// create success Result
function Ok<Val>(res: Val): OK<Val>;

// create error Result
function Err<Err>(err: Err): ERR<Err>;
```

### Helpers
```ts
// Convert exceptions into errors & function result into Ok
function toResult<Val, ERR>(fn: () => Val): Result<Val, ERR>;

// Convert promise reject into errors & promise resolve into Ok
async function toResultAsync<Val, ERR>(fn: () => Promise<Val>): Promise<Result<Val, ERR>>;
```

## Example
```ts
import { Ok, Err, Result, toResult, toResultAsync } from 'base-ts-result';

const generateNumber = (): Result<number, string> => {
    const num = Math.round(Math.random() * 100);

    if (num > 50) {
        // return ok result
        return Ok(num);
    }

    // return error result
    return Err('Number below 50');
};

const handleResult = (res: Result<number, string>) => {
    // Result is OK
    // ===============
    res.unwrap(); // 15
    res.unwrapOr(); // 15
    res.expect('Custom exception msg'); // 15
    res.unwrapErr(); // Exception: tried to get value as error from Ok result

    // Result is ERR
    // ===============
    res.unwrap(); // Exception: Unwrap error Result
    res.unwrapOr(-1); // -1
    res.expect('Custom exception msg'); // Exception: Custom exception msg
    res.unwrapErr(); // Error object

    // If you wanna handle error in higher function, just check 
    // =========================================================
    if (res.isError) {
        return res;
    }

    // some regular logic..
    return Ok('success handle result');
}

const getResult = () => {
    // res.isError = true;
    let res = toResult(() => {
        throw new Error('like to throw exceptions');
    });

    // res.isError = false;
    res = toResult(() => {
        return 7;
    });
};

const getResultAsync = async() => {
    // imitating promise with success result
    function timer<T>(val: T): Promise<T> {
        return new Promise(res => {
            setTimeout(() => {
                res(val);
            }, 100);
        });
    }

    // imitating promise with error result 
    function errTimer(): Promise<never> {
        return new Promise((_, rej) => {
            setTimeout(() => {
                rej();
            }, 100);
        });
    }

    // res.isError = false; res.unwrap() = 1;
    let res = await toResultAsync(() => {
        return timer(1);
    });

    // res.isError = true;
    res = await toResultAsync(() => {
        return errTimer();
    });
}

```

## Sources
- [:package: this package on npm](https://www.npmjs.com/package/base-ts-result)
- [:octocat: this package on github](https://github.com/Kostayne/base-ts-result)