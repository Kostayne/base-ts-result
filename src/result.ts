import { AsyncResult } from "./asyncResult";
import { ResultCaughtError, thrownUnknownToError } from "./baseResultError";

export type ResultPromise<T, E> = Promise<Result<T, E>>;

export interface Result<Val, Err> {
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
     * console.log(res.unwrapErr()); // Exception: Tried to unwrap Ok result's error
     * 
     * res = Err('error msg');
     * console.log(res.unwrapErr()); // 'error msg'
     */
    unwrapErr(): Err;

    /**
     * @param altVal
     * @description result.unwrapOr(altVal) will return altVal in case of error
     * @example
     * let res = Ok(5);
     * console.log(res.unwrapOr(0)); // 5
     * 
     * res = Err('error msg');
     * console.log(res.unwrapOr(0)); // 0
     */
    unwrapOr(altVal: Val): Val;

    /**
     * @param altValFactory
     * @description result.unwrapOrElse(altValFactory) will return return value of altValFactory in case of error
     * @example
     * let res = Ok(5);
     * console.log(res.unwrapOrElse(() => 0)); // 5
     * 
     * res = Err('error msg');
     * console.log(res.unwrapOrElse(() => 0)); // 0
     */
    unwrapOrElse(altValFactory: (err: Err) => Val): Val;

    /**
     * @param msg
     * @description result.expect(message) unwrap result or throw new Error with message in case of error
     * @example
     * let res = Ok(5);
     * console.log(res.expect('provided message')); // 5
     * 
     * res = Err('error msg');
     * console.log(res.expect('provided message')); // Exception: provided message
     */
    expect(msg: string): Val;

    /**
     * @param msg
     * @description result.expectErr(message) unwrap error or throw new Error with message in case of Ok
     * @example
     * let res = Ok(5);
     * console.log(res.expectErr('provided message')); // Exception: provided message
     * 
     * res = Err('error msg');
     * console.log(res.expectErr('provided message')); // 'error msg'
     */
    expectErr(msg: string): Err;

    /**
     * @description result.isOk() returns true if Result is Ok or false if result is Err
     * @example
     * let res = Ok(5);
     * console.log(res.isOk()); // true
     * 
     * res = Err('error msg');
     * console.log(res.isOk()); // false
     */
    isOk(): this is OK<Val>;

    /**
     * @description result.isErr() returns false if Result is Ok or true if result is Err
     * @example
     * let res = Ok(5);
     * console.log(res.isErr()); // false
     * 
     * res = Err('error msg');
     * console.log(res.isErr()); // true
     */
    isErr(): this is ERR<Err>;

    /**
     * @description result.ok() returns value of Result if it is Ok, or undefined if it is Err
     * @example
     * let res = Ok(5);
     * console.log(res.ok()); // 5
     * 
     * res = Err('error msg');
     * console.log(res.ok()); // undefined
     */
    ok(): Val | undefined,

    /**
     * @description result.err() returns undefined if Result is Ok, or contained error if Result is Err
     * @example
     * let res = Ok(5);
     * console.log(res.err()); // undefined
     * 
     * res = Err('error msg');
     * console.log(res.err()); // 'error msg'
     */
    err(): Err | undefined,

    /**
     * @param inspector
     * @description result.inspect() will run provided inspector if Result is Ok
     * @example
     * let res = Ok(5);
     * res.inspect((val) => console.log(`logged ${val}`)); // logged 5
     * 
     * res = Err('error msg');
     * res.inspect((val) => console.log(`logged ${val}`)); // <nothing>
     */
    inspect(inspector: (val: Val) => any): Result<Val, Err>;

    /**
     * @param inspector
     * @description result.inspectErr() will run provided inspector if Result is Err
     * @example
     * let res = Ok(5);
     * res.inspectErr((val) => console.log(`logged ${val}`)); // <nothing>
     * 
     * res = Err('error msg');
     * res.inspectErr((val) => console.log(`logged ${val}`)); // logged error msg
     */
    inspectErr(inspector: (err: Err) => any): Result<Val, Err>;

    /**
     * @param mapper
     * @description result.map(mapper) will run provided mapper with Result value if Result is Ok
     * @example
     * let res = Ok(5);
     * console.log(res.map((val) => val + 1).unwrap()); // 6
     */
    map<MappedVal>(mapper: (val: Val) => MappedVal): Result<MappedVal, Err>;

    /**
     * @param mapper
     * @param fallback
     * @description result.mapOrElse(mapper, fallback) will run provided mapper with Result value if Result is Ok
     *              ir run provided fallback with Result error if Result is Err
     * @example
     * let res = Ok(5);
     * console.log(res.map((val) => val + 1, err => err + ' suffix').unwrap()); // 6
     * 
     * res = Err('error msg');
     * console.log(res.map((val) => val + 1, err => err + ' suffix').unwrapErr()); // error msg suffix
     */
    mapOrElse<MappedVal>(mapper: (val: Val) => MappedVal, fallback: (err: Err) => MappedVal): Result<MappedVal, Err>;

    /**
     * @param mapper
     * @description result.mapErr(mapper) will run provided mapper with Result error if Result is Err
     * @example
     * let res = Err('error msg');
     * console.log(res.mapErr(err => err + ' suffix').unwrapErr()); // error msg suffix
     */
    mapErr<MappedErr>(mapper: (err: Err) => MappedErr): Result<Val, MappedErr>;

    toAsync(): AsyncResult<Val, Err>;
}

const origErrorPrefix = '> ';
class ERR<Err> implements Result<never, Err> {
    public readonly value!: Err;

    constructor(value: Err) {
        this.value = value;
    }

    private throwError(msg: string): never {
        throw new Error(msg + '\n' + this.getAdditionalErrorMessage());
    }

    private getAdditionalErrorMessage() {
        if (this.value instanceof Error) {
            const origErrStack = this.value.stack?.split('\n').map(line => origErrorPrefix + line).join('\n')
            return origErrorPrefix + 'Original error:\n' + origErrStack
        }
        if (typeof this.value === 'object') {
            return origErrorPrefix + 'Original error is object';
        }
        if (typeof this.value === 'number') {
            return origErrorPrefix + `Original error is: ${this.value}`;
        }
        if (typeof this.value === 'string') {
            return origErrorPrefix + `Original error is: "${this.value}"`;
        }
    }

    unwrap(): never {
        this.throwError('Tried to unwrap an Error result');
    }

    unwrapOr<Res>(alt: Res): Res {
        return alt;
    }
    unwrapOrElse<Res>(altValFactory: (err: Err) => Res): Res {
        return altValFactory(this.value);
    };

    expect(msg: string): never {
        this.throwError(msg);
    }
    expectErr(_msg: string): Err {
        return this.value;
    }

    unwrapErr(): Err {
        return this.value;
    }

    isOk(): false {
        return false;
    }

    isErr(): true {
        return true;
    }

    ok(): undefined {
        return undefined;
    }

    err(): Err {
        return this.value
    }

    inspect(_inspector: (val: never) => any): Result<never, Err> {
        return this as unknown as Result<never, Err>;
    }

    inspectErr(inspector: (err: Err) => any): Result<never, Err> {
        inspector(this.value);
        return Err(this.value);
    }

    map(_mapper: (val: never) => any): Result<never, Err> {
        return Err(this.value);
    }

    mapOrElse<MappedVal>(_mapper: any, fallback: (err: Err) => MappedVal): Result<MappedVal, never> {
        return Ok(fallback(this.value))
    }

    mapErr<MappedErr>(mapper: (err: Err) => MappedErr): Result<never, MappedErr> {
        return Err(mapper(this.value))
    }

    toAsync(this: Result<never, Err>): AsyncResult<never, Err> {
        return AsyncResult.fromResult(this);
    }
}

class OK<Val> implements Result<Val, never> {
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
    unwrapOrElse(_altValFactory: (err: never) => Val): Val {
        return this.value;
    };

    expect(_msg: string): Val {
        return this.value;
    }
    expectErr(msg: string): never {
        throw new Error(msg);
    }

    unwrapErr(): never {
        throw new Error('Tried to unwrap Ok result\'s error');
    }

    isOk(): true {
        return true;
    }

    isErr(): false {
        return false;
    }

    ok(): Val {
        return this.value;
    }

    err(): undefined {
        return undefined;
    }

    inspect(inspector: (val: Val) => any): Result<Val, never> {
        inspector(this.value);
        return Ok(this.value)
    }

    inspectErr(_inspector: (err: never) => any): Result<Val, never> {
        return Ok(this.value)
    }

    map<MappedVal>(mapper: (val: Val) => MappedVal): Result<MappedVal, never> {
        return Ok(mapper(this.value));
    }

    mapOrElse<MappedVal>(mapper: (val: Val) => MappedVal, _fallback: (err: never) => any): Result<MappedVal, never> {
        return Ok(mapper(this.value));
    }

    mapErr<MappedErr>(_mapper: (err: never) => any): Result<Val, MappedErr> {
        return Ok(this.value)
    }

    toAsync(this: Result<Val, never>): AsyncResult<Val, never> {
        return AsyncResult.fromResult(this);
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
    } catch (e) {
        return Err(e as E);
    }
}

/**
 * @description Creates function returning Result<T, E> from provided FN returning T and
 *              optional error mapper returning E. If FN throws exception, it is caught and passed to the error mapper.
 * @example
 * const rawFn = (a: number) => {
 *     if (a < 0) {
 *         throw new Error('not today')
 *     }
 *     return a;
 * };
 * const fn = resultify(
 *     rawFn,
 *     err => err.message
 * ); // (a: number) => Result<number, string>
 * const res = fn(-2); // Result<number, string>
 * res.err() // 'not today'
 */
export function resultify<TRes, TParams extends any[], E = ResultCaughtError>(
    fn: (...params: TParams) => TRes, mapErr?: (err: ResultCaughtError) => E
): (...params: TParams) => Result<TRes, E> {
    return (...params: Parameters<typeof fn>) => {
        try {
            const val = fn(...params);
            return Ok(val);
        } catch (err) {
            const wrappedErr = thrownUnknownToError(err);
            if (mapErr) {
                return Err(mapErr(wrappedErr));
            }
            return Err(wrappedErr) as unknown as Result<TRes, E>;
        }
    }
}

export type Ok<T> = OK<T>;
export type Err<T> = ERR<T>;
