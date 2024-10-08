/**
 *  @description Type for errors caught by resultify and fromPromise. Thrown non-Error values are converted to Error
 */
export type ResultBaseError = Error & { origValue?: unknown };

const isResultBaseError = (val: unknown): val is ResultBaseError => {
  if (!val || typeof val !== 'object') {
    return false;
  }

  if ('message' in val && 'name' in val && val.toString !== Object.prototype.toString) {
    return true;
  }

  return false;
};

export function thrownUnknownToBaseError(origValue: unknown): ResultBaseError {
  if (origValue instanceof Error) {
    return origValue;
  }

  if (isResultBaseError(origValue)) {
    return origValue;
  }

  return new BaseError(origValue);
}

/**
 *  @description Error-like wrapper for non-Error values caught by resultify and fromPromise.
 */
class BaseError implements Error {
  name = 'BaseError';
  message: string;
  stack?: string | undefined;

  /**
   * @description exotic value that was thrown
   */
  origValue: unknown;

  constructor(origValue: unknown) {
    const type = Array.isArray(origValue) ? 'array' : typeof origValue;

    this.message = `Caught exotic value (${type})`;
    this.origValue = origValue;

    if (typeof origValue?.toString !== 'function') {
      return;
    }

    const newMsg = origValue.toString();

    if (typeof newMsg !== 'string') {
      return;
    }

    this.message += `: ${newMsg}`;
  }

  toString() {
    return `${this.name}: ${this.message}`;
  }
}
