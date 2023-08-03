export interface Result<Val, Err> {
    readonly isError: boolean;
    readonly value: Val | Err;

    unwrap(): Val;
    unwrapErr(): Err;
    unwrapOr(altRes: Val): Val;

    expect(msg: string): Val;
}

class ERR<Err> implements Result<never, Err> {
    isError = true;
    public readonly value!: Err;

    constructor(value: Err) {
        this.value = value;
    }

    /**
     * @description if result is error, throws exception with panic message
     */
    unwrap<Res>(): Res {
        throw new Error('Unwrap error Result');
    }

    /**
     * @description if result is error, returns alt
     */
    unwrapOr<Res>(alt: Res): Res {
        return alt;
    }

    /**
     * @description if result is error, throws exception with provided message
     */
    expect<Res>(msg: string): Res {
        throw new Error(msg);
    }

    /**
     * @description returns error or throws exception
     */
    unwrapErr(): Err {
        return this.value;
    }
}

class OK<Val> implements Result<Val, never> {
    isError = false;
    readonly value!: Val;

    constructor(value: Val) {
        this.value = value;
    }

    unwrap(): Val {
        return this.value;
    }

    unwrapOr(val: Val): Val {
        return this.value;
    }

    expect(msg: string): Val {
        return this.value;
    }

    unwrapErr(): never {
        throw new Error('tried to get value as error from Ok result');
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