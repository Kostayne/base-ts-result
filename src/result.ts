import { AsyncResult } from './asyncResult';
import { type ResultBaseError, thrownUnknownToBaseError } from './baseResultError';

export type ResultPromise<T, E> = Promise<Result<T, E>>;
export type ReturnedResultPromise<T, E> = Promise<ReturnedResult<T, E>>;
export type ReturnedResult<T, E> = Ok<T> | Err<E> | Result<T, E>;

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
   * @description unwraps original value or replaces it with provided alternative if the result is Err
   * @example
   * let res = Ok('great success');
   * console.log(res.unwrapOr('not that great')); // prints great success
   *
   * res = Err('fatal error');
   * console.log(res.unwrapOr('not that great')); // prints not that great
   */
  unwrapOr(altVal: Val): Val;

  /**
   * @param altValFactory
   * @description unwraps original value if the result is Ok, otherwise returns value from factory function
   * @example
   * let res = Ok(5);
   * console.log(res.unwrapOrElse("not a number")); // prints 5
   *
   * res = Err('fatal error');
   * console.log(res.unwrapOrElse("not a number")); // prints not a number
   */
  unwrapOrElse(altValFactory: (err: Err) => Val): Val;

  /**
   * @param msg
   * @description unwraps result or throw new Error with message in case of error
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
   * @description unwraps error or throws new Error with provided message if the result is Ok
   * @example
   * let res = Ok(5);
   * console.log(res.expectErr('provided message')); // Exception: provided message
   *
   * res = Err('error msg');
   * console.log(res.expectErr('provided message')); // 'error msg'
   */
  expectErr(msg: string): Err;

  /**
   * @description returns true if Result is Ok or false if result is Err
   * @example
   * let res = Ok(5);
   * console.log(res.isOk()); // true
   *
   * res = Err('error msg');
   * console.log(res.isOk()); // false
   */
  isOk(): this is OK<Val>;

  /**
   * @description returns true if result is Err, otherwise returns false
   * @example
   * let res = Ok(5);
   * console.log(res.isErr()); // false
   *
   * res = Err('error msg');
   * console.log(res.isErr()); // true
   */
  isErr(): this is ERR<Err>;

  /**
   * @description returns value if result is Ok, or undefined if it's Err.
   * @example
   * let res = Ok(5);
   * console.log(res.ok()); // 5
   *
   * res = Err('error msg');
   * console.log(res.ok()); // undefined
   */
  ok(): Val | undefined;

  /**
   * @description returns error value if result is Err, or undefined if it is Ok.
   * @example
   * let res = Ok(5);
   * console.log(res.err()); // undefined
   *
   * res = Err('error msg');
   * console.log(res.err()); // 'error msg'
   */
  err(): Err | undefined;

  /**
   * @param inspector
   * @description Will run provided inspector if result is Ok
   * @example
   * let res = Ok(5);
   * res.inspect((val) => console.log(val)); // prints 5
   *
   * res = Err('error msg');
   * res.inspect((val) => console.log(val)); // prints nothing
   */
  inspect(inspector: (val: Val) => any): Result<Val, Err>;

  /**
   * @param inspector
   * @description will run provided inspector if result is Err
   * @example
   * let res = Ok(5);
   * res.inspect((val) => console.log(val)); // prints noting
   *
   * res = Err('error msg');
   * res.inspect((val) => console.log(val)); // prints error msg
   */
  inspectErr(inspector: (err: Err) => any): Result<Val, Err>;

  /**
   * @param mapper
   * @description returns new result with mapped value.
   * @example
   * const res = Ok(5);
   * const mappedRes = res.map((val) => val + 1);
   * console.log(mappedRes.unwrap()); // 6
   */
  map<MappedVal>(mapper: (val: Val) => MappedVal): Result<MappedVal, Err>;

  /**
     * @param mapper
     * @param fallback
     * @description returns new result with mapped ok value & mapped error value
     * @example
     * const mapOk = (val => val + 1);
     * const mapErr = (err => err + ' suffix');

     * console.log(Ok(5).unwrap()) // 6
     * console.log(Err('error msg').unwrapErr()) // error message suffix
     */
  mapOrElse<MappedVal>(mapper: (val: Val) => MappedVal, fallback: (err: Err) => MappedVal): Result<MappedVal, Err>;

  /**
   * @param mapper
   * @description returns new result with mapped error value.
   * @example
   * const res = Err('error msg');
   * const mappedRes = res.mapErr(err => err + ' suffix');
   * console.log(mappedRes.unwrapErr()); // error msg suffix
   */
  mapErr<MappedErr>(mapper: (err: Err) => MappedErr): Result<Val, MappedErr>;

  /**
   * @description returns new async result constructed from current result
   * @example
   * const res = Ok(5);
   * const asyncRes = res.toAsync();
   */
  toAsync(): AsyncResult<Val, Err>;
}

const origErrIndent = ' '.repeat(4);
const origErrorPrefix = origErrIndent + '> ';

class ERR<Err> implements Result<never, Err> {
  public readonly value!: Err;

  constructor(value: Err) {
    this.value = value;
  }

  private throwError(msg: string): never {
    throw new Error(msg + '\n' + origErrIndent + this.getAdditionalErrorMessage());
  }

  private prefixMultiLineStr(str: string | undefined) {
    return str
      ?.split('\n')
      .map((line) => origErrorPrefix + line)
      .join('\n');
  }

  private getAdditionalErrorMessage() {
    if (this.value instanceof Error) {
      return 'Original error:\n' + this.prefixMultiLineStr(this.value.stack);
    }
    if (typeof this.value === 'object') {
      if (this.value === null) {
        return 'Original error is null';
      }
      if (this.value.toString === Object.prototype.toString) {
        return 'Original error is object';
      }
      return `Original error:\n${this.prefixMultiLineStr(this.value.toString())}`;
    }
    if (typeof this.value === 'number') {
      return `Original error is: ${this.value}`;
    }
    if (typeof this.value === 'string') {
      return `Original error is: "${this.value}"`;
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
  }

  expect(msg: string): never {
    this.throwError(msg);
  }
  expectErr(_msg: string): Err {
    return this.value;
  }

  unwrapErr(): Err {
    return this.value;
  }

  isOk(): this is OK<never> {
    return false;
  }

  isErr(): this is ERR<Err> {
    return true;
  }

  ok(): undefined {
    return undefined;
  }

  err(): Err {
    return this.value;
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
    return Ok(fallback(this.value));
  }

  mapErr<MappedErr>(mapper: (err: Err) => MappedErr): Result<never, MappedErr> {
    return Err(mapper(this.value));
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
  }

  expect(_msg: string): Val {
    return this.value;
  }
  expectErr(msg: string): never {
    throw new Error(msg);
  }

  unwrapErr(): never {
    throw new Error("Tried to unwrap Ok result's error");
  }

  isOk(): this is OK<Val> {
    return true;
  }

  isErr(): this is ERR<never> {
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
    return Ok(this.value);
  }

  inspectErr(_inspector: (err: never) => any): Result<Val, never> {
    return Ok(this.value);
  }

  map<MappedVal>(mapper: (val: Val) => MappedVal): Result<MappedVal, never> {
    return Ok(mapper(this.value));
  }

  mapOrElse<MappedVal>(mapper: (val: Val) => MappedVal, _fallback: (err: never) => any): Result<MappedVal, never> {
    return Ok(mapper(this.value));
  }

  mapErr<MappedErr>(_mapper: (err: never) => any): Result<Val, MappedErr> {
    return Ok(this.value);
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
 *
 * @example
 * const res = toResult(() => throw new Error(''));
 * res.isErr() // true
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
 *
 * const fn = resultify(
 *     rawFn,
 *     err => err.message
 * ); // (a: number) => Result<number, string>
 *
 * const res = fn(-2); // Result<number, string>
 * res.err() // 'not today'
 */
export function resultify<TRes, TParams extends any[], E = ResultBaseError>(
  fn: (...params: TParams) => TRes,
  mapErr?: (err: ResultBaseError) => E,
): (...params: TParams) => Result<TRes, E> {
  return (...params: Parameters<typeof fn>) => {
    try {
      const val = fn(...params);
      return Ok(val);
    } catch (err) {
      const wrappedErr = thrownUnknownToBaseError(err);
      if (mapErr) {
        return Err(mapErr(wrappedErr));
      }
      return Err(wrappedErr) as unknown as Result<TRes, E>;
    }
  };
}

export type Ok<T> = OK<T>;
export type Err<T> = ERR<T>;
