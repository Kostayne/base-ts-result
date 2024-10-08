import { type ResultBaseError, thrownUnknownToBaseError } from './baseResultError';
import { Err, Ok, type ResultPromise, type Result, type ReturnedResultPromise } from './result';

export type AsyncResultPromise<T, E> = Promise<AsyncResult<T, E>>;
/**
 * Helper class containing promise of a Result. For more ergonomic usage of Results with async code
 */
export class AsyncResult<Val, Err> {
  /**
   * @param promise
   * @description returns AsyncResult containing the promise.
   * @example
   * const resPromise = AsyncResult.fromPromise(Promise.resolve(1));
   * // Type of resPromise is AsyncResult<number, unknown>
   */
  static fromPromise<Val>(promise: Promise<Val>): AsyncResult<Val, ResultBaseError> {
    const resultRawPromise: Promise<Result<Val, ResultBaseError>> = promise
      .then((val) => Ok(val))
      .catch((err) => Err(thrownUnknownToBaseError(err)));
    return new AsyncResult(resultRawPromise);
  }

  /**
   * @param result
   * @description returns AsyncResult containing promise of provided result
   * @example
   * const resPromise = AsyncResult.fromResult(Ok(5));
   * // Type of resPromise is AsyncResult<number, never>
   */
  static fromResult<Val, Err>(result: Result<Val, Err>): AsyncResult<Val, Err> {
    return new AsyncResult(Promise.resolve(result));
  }

  /**
   * @param resultPromise
   * @description AsyncResult.fromResultPromise(resultPromise) returns AsyncResult containing provided resultPromise
   * @example
   * const resPromise = AsyncResult.fromResult(Promise.resolve(Ok(5)));
   * // Type of resPromise is AsyncResult<number, never>
   */
  static fromResultPromise<Val, Err>(resultPromise: ResultPromise<Val, Err>): AsyncResult<Val, Err> {
    return new AsyncResult(resultPromise);
  }

  /**
   * @description Contained promise of Result
   * @example
   * const resPromise = AsyncResult.fromPromise(Promise.resolve(1), () => 'string');
   * const awaited  = await resPromise.promise;
   * // Type of awaited is Result<number, string>
   */
  readonly promise: Promise<Result<Val, Err>>;
  constructor(promise: Promise<Result<Val, Err>>) {
    this.promise = promise;
  }

  /**
   * @description returns promise of result value if it's not an error, otherwise throws an exception
   * @example
   * let res = AsyncResult.fromResult(Ok(5));
   * console.log(await res.unwrap()); // 5
   *
   * res = AsyncResult.fromResult(Err('err'));
   * console.log(await res.unwrap()); // Exception: Tried to unwrap an Error result
   */
  async unwrap(): Promise<Val> {
    return (await this.promise).unwrap();
  }

  /**
   * @description returns error value if it exists, otherwise throws an exception
   * @example
   * let res = AsyncResult.fromResult(Ok(5));
   * console.log(await res.unwrapErr()); // Exception: Tried to unwrap Ok result's error
   *
   * res = AsyncResult.fromResult(Err('error msg'));
   * console.log(await res.unwrapErr()); // 'error msg'
   */
  async unwrapErr(): Promise<Err> {
    return (await this.promise).unwrapErr();
  }

  /**
   * @param altVal
   * @description result.unwrapOr(altVal) will return altVal in case of error
   * @example
   * let res = AsyncResult.fromResult(Ok(5));
   * console.log(await res.unwrapOr(0)); // 5
   *
   * res = AsyncResult.fromResult(Err('error msg'));
   * console.log(await res.unwrapOr(0)); // 0
   */
  async unwrapOr(altVal: Val): Promise<Val> {
    return (await this.promise).unwrapOr(altVal);
  }

  /**
   * @param altValFactory
   * @description result.unwrapOrElse(altValFactory) will return return value of altValFactory in case of error
   * @example
   * let res = AsyncResult.fromResult(Ok(5));
   * console.log(await res.unwrapOrElse(async () => 0)); // 5
   *
   * res = AsyncResult.fromResult(Err('error msg'));
   * console.log(await res.unwrapOrElse(async () => 0)); // 0
   */
  async unwrapOrElse(altValFactory: (err: Err) => AsyncMapped<Val>): Promise<Val> {
    const res = await this.promise;
    if (res.isOk()) {
      return res.unwrap();
    }
    return altValFactory(res.unwrapErr());
  }

  /**
   * @param msg
   * @description result.expect(message) unwrap result or throw new Error with message in case of error
   * @example
   * let res = AsyncResult.fromResult(Ok(5));
   * console.log(await res.expect('provided message')); // 5
   *
   * res = AsyncResult.fromResult(Err('error msg'));
   * console.log(await res.expect('provided message')); // Exception: provided message
   */
  async expect(msg: string): Promise<Val> {
    return (await this.promise).expect(msg);
  }

  /**
   * @param msg
   * @description result.expectErr(message) unwrap error or throw new Error with message in case of Ok
   * @example
   * let res = AsyncResult.fromResult(Ok(5));
   * console.log(await res.expectErr('provided message')); // Exception: provided message
   *
   * res = AsyncResult.fromResult(Err('error msg'));
   * console.log(await res.expectErr('provided message')); // 'error msg'
   */
  async expectErr(msg: string): Promise<Err> {
    return (await this.promise).expectErr(msg);
  }

  /**
   * @description result.isOk() returns true if Result is Ok or false if result is Err
   * @example
   * let res = AsyncResult.fromResult(Ok(5));
   * console.log(await res.isOk()); // true
   *
   * res = AsyncResult.fromResult(Err('error msg'));
   * console.log(await res.isOk()); // false
   */
  async isOk(): Promise<boolean> {
    return (await this.promise).isOk();
  }

  /**
   * @description result.isErr() returns false if Result is Ok or true if result is Err
   * @example
   * let res = AsyncResult.fromResult(Ok(5));
   * console.log(await res.isErr()); // false
   *
   * res = AsyncResult.fromResult(Err('error msg'));
   * console.log(await res.isErr()); // true
   */
  async isErr(): Promise<boolean> {
    return (await this.promise).isErr();
  }

  /**
   * @description result.ok() returns value of Result if it is Ok, or undefined if it is Err
   * @example
   * let res = AsyncResult.fromResult(Ok(5));
   * console.log(await res.ok()); // 5
   *
   * res = AsyncResult.fromResult(Err('error msg'));
   * console.log(await res.ok()); // undefined
   */
  async ok(): Promise<Val | undefined> {
    return (await this.promise).ok();
  }

  /**
   * @description result.err() returns undefined if Result is Ok, or contained error if Result is Err
   * @example
   * let res = AsyncResult.fromResult(Ok(5));
   * console.log(await res.err()); // undefined
   *
   * res = AsyncResult.fromResult(Err('error msg'));
   * console.log(await res.err()); // 'error msg'
   */
  async err(): Promise<Err | undefined> {
    return (await this.promise).err();
  }

  /**
   * @param inspector
   * @description result.inspect() will run provided inspector if Result is Ok
   * @example
   * let res = AsyncResult.fromResult(Ok(5));
   * await res.inspect((val) => console.log(`logged ${val}`)).promise; // logged 5
   *
   * res = AsyncResult.fromResult(Err('error msg'));
   * await res.inspect((val) => console.log(`logged ${val}`)).promise; // <nothing>
   */
  inspect(inspector: (val: Val) => any): AsyncResult<Val, Err> {
    return this.thenInternal(async (res) => res.inspect(inspector));
  }

  /**
   * @param inspector
   * @description result.inspectErr() will run provided inspector if Result is Err
   * @example
   * let res = AsyncResult.fromResult(Ok(5));
   * await res.inspectErr((val) => console.log(`logged ${val}`)).promise; // <nothing>
   *
   * res = AsyncResult.fromResult(Err('error msg'));
   * await res.inspectErr((val) => console.log(`logged ${val}`)).promise; // logged error msg
   */
  inspectErr(inspector: (err: Err) => any): AsyncResult<Val, Err> {
    return this.thenInternal(async (res) => res.inspectErr(inspector));
  }

  /**
   * @param mapper
   * @description result.map(mapper) will run provided mapper with Result value if Result is Ok
   * @example
   * let res = AsyncResult.fromResult(Ok(5));
   * console.log(await res.map((val) => val + 1).unwrap()); // 6
   */
  map<NewVal>(mapper: (val: Val) => AsyncMapped<NewVal>): AsyncResult<NewVal, Err> {
    return this.thenInternal(async (res): Promise<Result<NewVal, Err>> => {
      if (res.isOk()) {
        return Ok(await mapper(res.unwrap()));
      }

      return Err(res.unwrapErr());
    });
  }

  /**
   * @param mapper
   * @param fallback
   * @description result.mapOrElse(mapper, fallback) will run provided mapper with Result value if Result is Ok
   *              ir run provided fallback with Result error if Result is Err
   * @example
   * let res = AsyncResult.fromResult(Ok(5));
   * console.log(await res.map((val) => val + 1, err => err + ' suffix').unwrap()); // 6
   *
   * res = AsyncResult.fromResult(Err('error msg'));
   * console.log(await res.map((val) => val + 1, err => err + ' suffix').unwrapErr()); // error msg suffix
   */
  mapOrElse<NewVal>(
    mapper: (val: Val) => AsyncMapped<NewVal>,
    fallback: (err: Err) => AsyncMapped<NewVal>,
  ): AsyncResult<NewVal, Err> {
    return this.thenInternal(async (res): Promise<Result<NewVal, Err>> => {
      if (res.isOk()) {
        return Ok(await mapper(res.unwrap()));
      }

      return Ok(await fallback(res.unwrapErr()));
    });
  }

  /**
   * @param mapper
   * @description result.mapErr(mapper) will run provided mapper with Result error if Result is Err
   * @example
   * let res = AsyncResult.fromResult(Err('error msg'));
   * console.log(await res.mapErr(err => err + ' suffix').unwrapErr()); // error msg suffix
   */
  mapErr<NewErr>(mapper: (err: Err) => AsyncMapped<NewErr>): AsyncResult<Val, NewErr> {
    return this.thenInternal(async (res): Promise<Result<Val, NewErr>> => {
      if (res.isOk()) {
        return Ok(res.unwrap());
      }

      return Err(await mapper(res.unwrapErr()));
    });
  }

  private thenInternal<NewVal, NewErr>(
    mapper: (result: Result<Val, Err>) => AsyncMapped<Result<NewVal, NewErr>>,
  ): AsyncResult<NewVal, NewErr> {
    return new AsyncResult(this.promise.then(mapper));
  }
}

type AsyncMapped<T> = T | Promise<T>;

/**
 * @description Creates function returning AsyncResult<T, E> from provided FN returning Promise<T> and
 *              optional error mapper returning E or Promise<E>.
 *              If FN throws exception, it is caught and passed to the error mapper.
 * @example
 * const rawFn = async (a: number) => {
 *     if (a < 0) {
 *         throw new Error('not today')
 *     }
 *     return a;
 * };
 *
 * const fn = asyncResultify(
 *     rawFn,
 *     async err => err.message
 * ); // (a: number) => AsyncResult<number, string>
 *
 * const res = fn(-2); // AsyncResult<number, string>
 * await res.err() // 'not today'
 */
export function asyncResultify<TRes, TParams extends any[], E = ResultBaseError>(
  fn: (...params: TParams) => Promise<TRes>,
  mapErr?: (err: ResultBaseError) => AsyncMapped<E>,
): (...params: TParams) => AsyncResult<TRes, E> {
  return (...params: Parameters<typeof fn>) => {
    const asyncPromise = AsyncResult.fromPromise(fn(...params));
    if (mapErr) {
      return asyncPromise.mapErr(mapErr);
    }
    return asyncPromise as AsyncResult<TRes, E>;
  };
}

/**
 * @param fn
 * @description Wraps fn changing its return type from ResultPromise<T, E> to AsyncResult<T, E>
 * @example
 * const resultPromiseFn = async (a: number): ResultPromise<number, string> => {
 *     if (a < 0) {
 *         return Err('err');
 *     }
 *
 *     return Ok(a);;
 * };
 *
 * const resUnwrapped = (await resultPromiseFn(2)).unwrap();
 *
 * const fn = createAsyncResultFn(resultPromiseFn); // (a: number) => AsyncResult<number, string>
 * const resWrapped = await fn(2).unwrap(); // Same result, with more convenient async handling
 */
export function createAsyncResult<TRes, TParams extends any[], E>(
  fn: (...params: TParams) => ReturnedResultPromise<TRes, E>,
): (...params: TParams) => AsyncResult<TRes, E> {
  return (...params: Parameters<typeof fn>) => {
    return AsyncResult.fromResultPromise(fn(...params)) as AsyncResult<TRes, E>;
  };
}

/**
 * @param promise
 * @description Converts promise resolve / reject to Ok() or Err()
 * @example
 * const promise = Promise.reject();
 * const result = toAsyncResult(promise);
 */
export function toAsyncResult<Val>(promise: Promise<Val>): AsyncResult<Val, ResultBaseError> {
  return AsyncResult.fromPromise(promise);
}
