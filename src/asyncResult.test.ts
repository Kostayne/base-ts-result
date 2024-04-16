
import { describe, expect, it } from '@jest/globals';
import { Err, Ok } from './result';

import { AsyncResult, asyncResultify } from './asyncResult';

describe('Constructors', () => {
    it('Simple Ok async result constructed from Ok result resolves to the provided result', async () => {
        const okRes = Ok(1);
        const res = await AsyncResult.fromResult(okRes).promise
        expect(res).toStrictEqual(okRes);
    });

    it('Simple Err async result constructed from Err result resolves to the provided result', async () => {
        const errRes = Err(1);
        const res = await AsyncResult.fromResult(errRes).promise
        expect(res).toStrictEqual(errRes);
    });

    it('Simple Ok async result constructed from promise of okRes, resolves to Ok result of provided value', async () => {
        const res = await AsyncResult.fromPromise(Promise.resolve(1)).promise;
        expect(res).toEqual(Ok(1));
    });

    it(
        'Simple Err async result constructed from promise of errRes which rejects with non-Error value, '
        + 'resolves to Err of the value wrapped with BaseResultError',
        async () => {
            const res = await AsyncResult.fromPromise(Promise.reject(1)).promise;
            expect(res.unwrapErr().toString()).toMatchInlineSnapshot(`"BaseError: Caught exotic value (number): 1"`);
        }
    );
    it(
        'Simple Err async result constructed from promise of errRes which rejects with Error value, '
        + 'resolves to Err of the value',
        async () => {
            const res = await AsyncResult.fromPromise(Promise.reject(new Error('err'))).promise;
            expect(res).toEqual(Err(new Error('err')));
        }
    );
});

describe('Result methods', () => {
    it('unwrap on Ok resolves to value', async () => {
        const asyncRes = AsyncResult.fromResult(Ok(1))
        expect(await asyncRes.unwrap()).toEqual(1);
    });
    it('unwrap on Err throws rejects', async () => {
        const asyncRes = AsyncResult.fromResult(Err(1))
        expect(asyncRes.unwrap()).rejects.toThrow();
    });

    it('composite test showing all simple result getters', async () => {
        const asyncOkRes = AsyncResult.fromResult(Ok(1))
        expect(await asyncOkRes.ok()).toEqual(1);
        expect(await asyncOkRes.err()).toEqual(undefined);
        expect(await asyncOkRes.isOk()).toEqual(true);
        expect(await asyncOkRes.isErr()).toEqual(false);
        expect(await asyncOkRes.expect('err')).toEqual(1);
        expect(await asyncOkRes.unwrapOr(2)).toEqual(1);
        expect(await asyncOkRes.unwrapOrElse(() => {
            expect('to not have been called').toBe(true);
            return 2;
        })).toEqual(1);
        expect(asyncOkRes.expectErr('err')).rejects.toThrow(Error('err'));
        expect(asyncOkRes.unwrapErr()).rejects.toThrow();

        const asyncErrRes = AsyncResult.fromResult(Err(1))
        expect(await asyncErrRes.ok()).toEqual(undefined);
        expect(await asyncErrRes.err()).toEqual(1);
        expect(await asyncErrRes.isOk()).toEqual(false);
        expect(await asyncErrRes.isErr()).toEqual(true);
        expect(await asyncErrRes.expectErr('err')).toEqual(1);
        expect(await asyncErrRes.unwrapOr(2)).toEqual(2);
        expect(await asyncErrRes.unwrapOrElse(() => {
            return 2;
        })).toEqual(2);
        expect(await asyncErrRes.unwrapOrElse(async () => {
            return 2;
        })).toEqual(2);
        expect(asyncErrRes.unwrap()).rejects.toThrow();
        expect(asyncErrRes.expect('err')).rejects.toThrowErrorMatchingInlineSnapshot(`
"err
> Original error is: 1"
`);
    });
});

describe('mappers', () => {
    it('inspect gets called with Result value if Result is Ok', async () => {
        let inspected: number | undefined = undefined;
        await AsyncResult.fromResult(Ok(5)).inspect(val => inspected = val).promise;
        expect(inspected).toEqual(5);
    });

    it('inspect does not get called if Result is Err', async () => {
        await AsyncResult.fromResult(Err(5)).inspect(() => {
            expect('to not have been called').toBe(true);
        }).promise;
    });

    it('inspectErr gets called with Result error if Result is Err', async () => {
        let inspected: number | undefined = undefined;
        await AsyncResult.fromResult(Err(5)).inspectErr(val => inspected = val).promise;
        expect(inspected).toEqual(5);
    });

    it('inspectErr does not get called if Result is Ok', async () => {
        await AsyncResult.fromResult(Ok(5)).inspectErr(() => {
            expect('to not have been called').toBe(true);
        }).promise;
    });

    it('map runs provided mapper on value of Result, and creates new Result', async () => {
        const res1 = AsyncResult.fromResult(Ok(5))
        const res2 = res1.map(val => val + 1);
        expect(await res1.unwrap()).toEqual(5)
        expect(await res2.unwrap()).toEqual(6)
    });
    it('async map runs provided mapper on value of Result, and creates new Result', async () => {
        const res1 = AsyncResult.fromResult(Ok(5))
        const res2 = res1.map(async val => val + 1);
        expect(await res1.unwrap()).toEqual(5)
        expect(await res2.unwrap()).toEqual(6)
    });

    it('map does not get run on Err', async () => {
        const res1 = AsyncResult.fromResult(Err(5))
        const res2 = res1.map(() => {
            expect('to not have been called').toBe(true);
        });
        expect(await res2.unwrapErr()).toEqual(5)
    });

    it('mapErr runs provided mapper on err of Result, and creates new Result', async () => {
        const res1 = AsyncResult.fromResult(Err(5))
        const res2 = res1.mapErr(val => val + 1);
        expect(await res1.unwrapErr()).toEqual(5)
        expect(await res2.unwrapErr()).toEqual(6)
    });
    it('async mapErr runs provided mapper on err of Result, and creates new Result', async () => {
        const res1 = AsyncResult.fromResult(Err(5))
        const res2 = res1.mapErr(async val => val + 1);
        expect(await res1.unwrapErr()).toEqual(5)
        expect(await res2.unwrapErr()).toEqual(6)
    });

    it('mapErr does not get run on Ok', async () => {
        const res1 = AsyncResult.fromResult(Ok(5))
        const res2 = res1.mapErr(() => {
            expect('to not have been called').toBe(true);
        });
        expect(await res2.unwrap()).toEqual(5)
    });

    it('mapOrElse runs provided mapper on value of Result, and creates new Result', async () => {
        const res1 = AsyncResult.fromResult(Ok(5))
        const res2 = res1.mapOrElse(val => val + 1, () => {
            expect('to not have been called').toBe(true)
            return 0;
        });
        expect(await res1.unwrap()).toEqual(5)
        expect(await res2.unwrap()).toEqual(6)
    });
    it('async mapOrElse runs provided mapper on value of Result, and creates new Result', async () => {
        const res1 = AsyncResult.fromResult(Ok(5))
        const res2 = res1.mapOrElse(async val => val + 1, () => {
            expect('to not have been called').toBe(true)
            return 0;
        });
        expect(await res1.unwrap()).toEqual(5)
        expect(await res2.unwrap()).toEqual(6)
    });

    it('mapOrElse runs provided fallback on err of Result, and creates new Ok Result', async () => {
        const res1 = AsyncResult.fromResult(Err(5))
        const res2 = res1.mapOrElse(() => {
            expect('to not have been called').toBe(true)
            return 0;
        }, err => err + 1);
        expect(await res2.unwrap()).toEqual(6)
    });
    it('async mapOrElse runs provided fallback on err of Result, and creates new Ok Result', async () => {
        const res1 = AsyncResult.fromResult(Err(5))
        const res2 = res1.mapOrElse(async () => {
            expect('to not have been called').toBe(true)
            return 0;
        }, err => err + 1);
        expect(await res2.unwrap()).toEqual(6)
    });
});

describe('utils', () => {
    it('Result toAsync and back', async () => {
        const res = Ok(1);
        expect(await res.toAsync().promise).toStrictEqual(res);
    })

    it('asyncResultify Ok result - calling new function returns AsyncResult', async () => {
        const test = asyncResultify(async () => 1, () => 1)
        expect(await test().promise).toEqual(Ok(1));
    })

    it(
        'asyncResultify Err result - calling new function returns AsyncResult and errMapper gets applied to result',
        async () => {
            const test = asyncResultify(async () => { throw 1; }, () => 'err')
            expect(await test().promise).toEqual(Err('err'));
        }
    )

});
