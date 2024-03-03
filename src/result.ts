export interface Result<Val, Err> {
    readonly isError: boolean;
    readonly value: Val | Err;

    /**
     * @description returns result value if it's not an error, otherwise throws an exception
     * @example
     * let res = Ok(5);
     * console.log(res.unwrap()); // 5
     * 
     * res = Err('err');
     * console.log(res.unwrap()); // Exception: Tried to unwrap an Error result
     */
    unwrap(): Val;

    /**
     * @description returns error value if it exists, otherwise throws an exception
     * @example
     * let res = Ok(5);
     * console.log(res.unwrapErr()); // Exception: Tried to unwrap an Ok result error
     * 
     * res = Err('error msg');
     * console.log(res.unwrapErr()); // 'error msg'
     */
    unwrapErr(): Err;

    /**
     * @param altVal
     * @description result.unwrap() will return altVal in case of error
     * @example
     * let res = Ok(5);
     * console.log(res.unwrapOr(0)); // 5
     * 
     * res = Err('error msg');
     * console.log(res.unwrapOr(0)); // 0
     */
    unwrapOr(altVal: Val): Val;

    expect(msg: string): Val;
}

class ERR<Err> implements Result<never, Err> {
    isError = true;
    public readonly value!: Err;

    constructor(value: Err) {
        this.value = value;
    }

    unwrap<Res>(): Res {
        throw new Error('Tried to unwrap an Error result');
    }

    unwrapOr<Res>(alt: Res): Res {
        return alt;
    }

    expect<Res>(msg: string): Res {
        throw new Error(msg);
    }

    unwrapErr(): Err {
        return this.value;
    }
}

class OK<Val> implements Result<Val, never> {
    isError = false;
    readonly value!: Val;

    constructor(value: Val) {
        this.value = value;
    }

    unwrap(): Val {
        return this.value;
    }

    unwrapOr(_val: Val): Val {
        return this.value;
    }

    expect(_msg: string): Val {
        return this.value;
    }

    unwrapErr(): never {
        throw new Error('Tried to unwrap Ok result\'s error');
    }
}

/**
 * @description Create success option
 */
export function Ok<T>(res: T): OK<T> {
    return new OK(res);
}

/**
 * @description Create error option
 */
export function Err<T>(err: T): ERR<T> {
    return new ERR(err);
}

/**
 * @description Catches exceptions and converts them into Result
*/
export function toResult<T, E>(fn: () => T): Result<T, E> {
    try {
        const val = fn();
        return Ok(val);
    } catch(e) {
        return Err(e as E);
    }
}

export async function toResultAsync<T, E>(tg: Promise<T> | (() => Promise<T>)): Promise<Result<T, E>> {
    if (typeof tg !== 'function' && typeof tg !== 'object') {
        throw new Error('toResultAsync accepts only promises or functions that return a promise');
    }

    const promise = typeof tg === 'object' ? tg : tg();

    return promise.then((val) => {
        return Ok(val);
    })
    .catch(err => {
        return Err(err);
    });
}