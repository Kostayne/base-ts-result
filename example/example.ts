import { Ok, Err, type Result, toResult } from '../src/index';

const getRes = (): Result<number, string> => {
    const val = Math.random();

    if (val > 0.5) {
        return Ok(val);
    }

    return Err('number is too low');
};

/**
 * @description returns random value or zero if random value <= 0.5
 */
const handleRes = () => {
    return getRes()
        .inspect((v) => console.log(`Got ok value ${v}`))
        .inspectErr((e) => console.error(e))
        .unwrapOr(0);
};

handleRes();
