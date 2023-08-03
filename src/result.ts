export abstract class Result<Val, Err> {
    abstract isError: boolean;

    abstract unwrap(): Val;
    abstract unwrapOr(altRes: Val): Val;
    abstract expect(msg: string): Val;

}

class ERR<Val, Err> extends Result<Val, Err> {
    isError = true;
    readonly value!: Err;

    constructor(value: Err) {
        super();
        this.value = value;
    }

    /**
     * @description if result is error, throws exception with panic message
     */
    unwrap(): Val {
        throw new Error('Unwrap error Result');
    }

    /**
     * @description if result is error, returns alt
     */
    unwrapOr(alt: Val): Val {
        return alt;
    }

    /**
     * @description if result is error, throws exception with provided message
     */
    expect(msg: string): Val {
        throw new Error(msg);
    }
}

class OK<Val, Err> extends Result<Val, Err> {
    isError = false;
    readonly value!: Val;

    constructor(value: Val) {
        super();
        this.value = value;
    }

    unwrap(): Val {
        return this.value;
    }

    unwrapOr(): Val {
        return this.value;
    }

    expect(msg: string): Val {
        return this.value;
    }
}

/**
 * @description Create success option
 */
export function Ok<Val, Err>(res: Val): Result<Val, Err> {
    return new OK(res);
}

/**
 * @description Create error option
 */
export function Err<Val, Err>(err: Err): Result<Val, Err> {
    return new ERR(err);
}