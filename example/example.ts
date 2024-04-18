import { type Result, Err, Ok, resultify, createAsyncResult, type ResultPromise } from '../src/index';

const generateRandomNum = (): Result<number, string> => {
    const num = Math.round(Math.random() * 100);

    if (num > 50) {
        // return ok result
        return Ok(num);
    }

    // return error result
    return Err('Num below 50');
};

const printNumA = () => {
    const res = generateRandomNum();

    if (res.isErr()) {
        // return error result to higher function,
        // where error will be resolved
        // or handle it right here, why not?
        return res;
    }

    console.log(res.unwrap());
};

const printNumB = () => {
    // panic if generateRandomNum returns error result
    // (throws exception)
    const num = generateRandomNum().unwrap();
    console.log(num);
};

const printNumC = () => {
    // panic if generateRandomNum returns error result
    // (throws exception with message "Error while generating number")
    const num = generateRandomNum().expect('Error while generating number');
    console.log(num);
};

const printNumD = () => {
    // replace error result value with 15
    const num = generateRandomNum().unwrapOr(15);
    console.log(num);
};

const resultifyExample = () => {
    const fnThatThrows = (arg: number) => {
        if (arg) {
            throw new Error('Did you expect a number?');
        }

        return 2;
    };

    const resultifiedFn = resultify(fnThatThrows);
    const res = resultifiedFn(1);
    res.err(); // Did you expect...

    // You can also map the error
    const resultifiedAndMapped = resultify(fnThatThrows, (e) => e.name);
};

const asyncResExample = async () => {
    const resultPromiseFn = async (a: number): ResultPromise<number, string> => {
        if (a < 0) {
            return Err('err');
        }

        return Ok(a);
    };

    {
        // Not great, never do this
        const val = (await resultPromiseFn(2)).unwrap();
    }

    // Way better, always do this for one result
    const res = await resultPromiseFn(2);
    const val = res.unwrap();
};

const createAsyncResultExample = async () => {
    const resultPromiseFn = async (a: number): ResultPromise<number, string> => {
        if (a < 0) {
            return Err('err');
        }

        return Ok(a);
    };

    // Great for many results
    const fn = createAsyncResult(resultPromiseFn);
    const val1 = await fn(2).unwrap();
    const val2 = await fn(3).unwrap();
    const val3 = await fn(4).unwrap();
};
