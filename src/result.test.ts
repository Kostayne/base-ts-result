import { describe, expect, it } from '@jest/globals';
import { Err, Ok, Result, toResult, toResultAsync } from './result';

function timer<T>(val: T): Promise<T> {
    return new Promise(res => {
        setTimeout(() => {
            res(val);
        }, 100);
    });
}

function errTimer(): Promise<never> {
    return new Promise((_, rej) => {
        setTimeout(() => {
            rej();
        }, 100);
    });
}

describe('Constructors', () => {
    it('Err fn produces correct Result', () => {
        const errRes = Err('Test err');
        expect(errRes).toEqual({ value: 'Test err', isError: true });
    });

    it('Ok fn produces correct Result', () => {
        const okRes = Ok('Test res');
        expect(okRes).toEqual({ isError: false, value: 'Test res' });
    });
});

describe('Result methods', () => {
    it('IsErr returns true in Err results & false in Ok results', () => {
        expect(Err(true).isError).toBe(true);
        expect(Ok(true).isError).toBe(false);
    });

    it('Unwrap returns value, if it exists', () => {
        expect(Ok(1).unwrap()).toBe(1);
    });

    it('Unwrap throws exception, if error exists', () => {
        expect(() => Err('err').unwrap()).toThrow();
    });

    it('Expect not trows error, if result not is error', () => {
        expect(() => Ok(3).expect('Should not fail')).not.toThrow();
    });

    it('Expect trows error, if result is error', () => {
        expect(() => Err('Should fail').expect('Should fail')).toThrowError(new Error('Should fail'));
    });

    it('UnwrapOr returns alt argument if result is error', () => {
        expect(Err('err').unwrapOr(4)).toBe(4);
    });

    it('UnwrapOr returns alt argument if result is not error', () => {
        expect(Ok(5).unwrapOr(0)).toBe(5);
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
        const res = toResult<string, string>(() => { throw new Error('as') });
        expect(res.unwrapOr('err')).toBe('err');
    });

    it('ToResultAsync works with resolved promises', async () => {
        const res = await toResultAsync(() => {
            return timer(8);
        });

        expect(res.unwrap()).toBe(8);
    });

    it('ToResultAsync works with rejected promises', async () => {
        const res = await toResultAsync(() => {
            return errTimer();
        });

        expect(res.isError).toBe(true);
    });
});