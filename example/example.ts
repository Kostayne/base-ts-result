import { Result, Err, Ok } from '../src/index';

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
    
    if (res.isError) {
        // return error result to higher function,
        // where error will be resolved
        // or handle it right here, why not?
        return res;
    }

    console.log(res.unwrap());
}

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
}

const printNumD = () => {
    // replace error result value with 15
    const num = generateRandomNum().unwrapOr(15);
    console.log(num);
}