import { describe, expect, it } from '@jest/globals';
import { Err, Ok, Result } from './result';

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
});