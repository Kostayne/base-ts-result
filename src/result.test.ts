import { describe, expect, it } from '@jest/globals';
import { Err, Ok, type Result, resultify, toResult } from './result';

describe('Constructors', () => {
    it('Err fn produces correct Result', () => {
        const errRes = Err('Test err');
        expect(errRes).toEqual({ value: 'Test err' });
    });

    it('Ok fn produces correct Result', () => {
        const okRes = Ok('Test res');
        expect(okRes).toEqual({ value: 'Test res' });
    });
});

describe('Result methods', () => {
    it('Unwrap returns value, if it exists', () => {
        expect(Ok(1).unwrap()).toBe(1);
    });

    it('Unwrap throws exception, if error exists', () => {
        expect(() => Err('err').unwrap()).toThrow();
    });

    it('UnwrapErr returns error value, if Result is Err', () => {
        expect(Err(1).unwrapErr()).toBe(1);
    });

    it('UnwrapErr throws exception, if Result is Ok', () => {
        expect(() => Ok('no err').unwrapErr()).toThrow();
    });

    it('Expect does not throw error, if result is Ok', () => {
        expect(() => Ok(3).expect('Should not fail')).not.toThrow();
    });

    it('Expect throws error, if result is Err', () => {
        expect(() => Err('Should fail').expect('Should fail')).toThrowErrorMatchingInlineSnapshot(`
"Should fail
    Original error is: "Should fail""
`);
    });

    it('ExpectErr throws error, if result is Ok', () => {
        expect(() => Ok(3).expectErr('Should fail')).toThrowError(new Error('Should fail'));
    });

    it('ExpectErr does not throw error, if result is Err', () => {
        expect(() => Err('Should not fail').expectErr('Should not fail')).not.toThrow();
    });

    it('UnwrapOr returns alt argument if result is error', () => {
        expect(Err('err').unwrapOr(4)).toBe(4);
    });

    it('UnwrapOr returns alt argument if result is not error', () => {
        expect(Ok(5).unwrapOr(0)).toBe(5);
    });

    it('UnwrapOrElse does not call altValFactory argument if result is Ok', () => {
        Ok(5).unwrapOrElse(() => {
            expect('to not have been called').toBe(true);
            return 0;
        });
    });

    it('UnwrapOrElse returns result of altValFactory argument if result is error', () => {
        expect(Err('err').unwrapOrElse(() => 4)).toBe(4);
    });

    it('UnwrapErr returns value from ERR instance', () => {
        const t: Result<number, string> = Err('err string');
        expect(t.unwrapErr()).toBe('err string');
    });

    it('UnwrapErr throws exception if called in OK instance', () => {
        const t: Result<number, string> = Ok(6);
        expect(() => t.unwrapErr()).toThrow();
    });

    it('ToResult returns OK if exception was not thrown', () => {
        const res = toResult(() => 7);
        expect(res.unwrap()).toBe(7);
    });

    it('ToResult returns ERR if exception was thrown', () => {
        const res = toResult<string, string>(() => {
            throw new Error('as');
        });
        expect(res.unwrapOr('err')).toBe('err');
    });

    it('isOk returns true if result is Ok', () => {
        expect(Ok(false).isOk()).toEqual(true);
    });
    it('isOk returns false if result is Err', () => {
        expect(Err(true).isOk()).toEqual(false);
    });
    it('isErr returns false if result is Ok', () => {
        expect(Ok(true).isErr()).toEqual(false);
    });
    it('isErr returns true if result is Err', () => {
        expect(Err(false).isErr()).toEqual(true);
    });

    it('ok returns Result value if result is Ok', () => {
        expect(Ok(5).ok()).toEqual(5);
    });

    it('ok returns undefined if result is Err', () => {
        expect(Err(5).ok()).toEqual(undefined);
    });

    it('err returns Result error if result is Err', () => {
        expect(Err(5).err()).toEqual(5);
    });

    it('err returns undefined if result is Ok', () => {
        expect(Ok(5).err()).toEqual(undefined);
    });
});

describe('mappers', () => {
    it('inspect gets called with Result value if Result is Ok', () => {
        let inspected: number | undefined = undefined;
        Ok(5).inspect((val) => (inspected = val));
        expect(inspected).toEqual(5);
    });

    it('inspect does not get called if Result is Err', () => {
        Err(5).inspect(() => {
            expect('to not have been called').toBe(true);
        });
    });

    it('inspectErr gets called with Result error if Result is Err', () => {
        let inspected: number | undefined = undefined;
        Err(5).inspectErr((val) => (inspected = val));
        expect(inspected).toEqual(5);
    });

    it('inspectErr does not get called if Result is Err', () => {
        Ok(5).inspectErr(() => {
            expect('to not have been called').toBe(true);
        });
    });

    it('map runs provided mapper on value of Result, and creates new Result', () => {
        const res1 = Ok(5);
        const res2 = res1.map((val) => val + 1);
        expect(res1).not.toStrictEqual(res2);
        expect(res1.unwrap()).toEqual(5);
        expect(res2.unwrap()).toEqual(6);
    });

    it('map does not get run on Err', () => {
        const res1 = Err(5);
        const res2 = res1.map(() => {
            expect('to not have been called').toBe(true);
        });
        expect(res2.unwrapErr()).toEqual(5);
    });

    it('mapErr runs provided mapper on err of Result, and creates new Result', () => {
        const res1 = Err(5);
        const res2 = res1.mapErr((val) => val + 1);
        expect(res1).not.toStrictEqual(res2);
        expect(res1.unwrapErr()).toEqual(5);
        expect(res2.unwrapErr()).toEqual(6);
    });

    it('mapErr does not get run on Ok', () => {
        const res1 = Ok(5);
        const res2 = res1.mapErr(() => {
            expect('to not have been called').toBe(true);
        });
        expect(res2.unwrap()).toEqual(5);
    });

    it('mapOrElse runs provided mapper on value of Result, and creates new Result', () => {
        const res1 = Ok(5);
        const res2 = res1.mapOrElse(
            (val) => val + 1,
            () => expect('to not have been called').toBe(true),
        );
        expect(res1).not.toStrictEqual(res2);
        expect(res1.unwrap()).toEqual(5);
        expect(res2.unwrap()).toEqual(6);
    });

    it('mapOrElse runs provided fallback on err of Result, and creates new Ok Result', () => {
        const res1 = Err(5);
        const res2 = res1.mapOrElse(
            () => expect('to not have been called').toBe(true),
            (err) => err + 1,
        );
        expect(res2.unwrap()).toEqual(6);
    });
});

describe('utils', () => {
    it('resultify Ok result - calling new function returns AsyncResult', () => {
        const test = resultify(
            () => 1,
            () => 1,
        );
        expect(test()).toEqual(Ok(1));
    });

    it('resultify Err result - calling new function returns AsyncResult and errMapper gets applied to result', () => {
        const test = resultify(
            () => {
                throw 1;
            },
            () => 'err',
        );
        expect(test()).toEqual(Err('err'));
    });

    it('resultify thrown non-Error err can be accessed', () => {
        const test = resultify(() => {
            throw 1;
        });

        const err = test().unwrapErr();
        if ('origValue' in err) {
            expect(err.origValue).toEqual(1);
        }
    });

    it(
        'resultify thrown non-Error which satisfies Error interface, does not get swallowed by BaseResultError ' +
        'nor by unwrap error message',
        () => {
            class ErrorLike implements Error {
                name = 'ErrorLike';
                message = 'message';

                toString() {
                    return `${this.name}: ${this.message}\n    at some\n    at pseudo\n    at stacktrace`;

                }
            }
            const errorLikeObj = new ErrorLike()
            const test = resultify(() => {
                throw errorLikeObj;
            });

            expect(test().err()).toEqual(errorLikeObj);
            try {
                test().unwrap();
            } catch (err) {
                expect(err?.toString()).toMatchInlineSnapshot(`
"Error: Tried to unwrap an Error result
    Original error:
    > ErrorLike: message
    >     at some
    >     at pseudo
    >     at stacktrace"
`);
            }
        }
    );
});
