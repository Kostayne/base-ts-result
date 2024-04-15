
/**
 *  @description Type for errors caught by resultify and fromPromise. Thrown non-Error values are converted to Error
 */
export type ResultBaseError = BaseError | Error;
export function thrownUnknownToBaseError(origValue: unknown): ResultBaseError {
	if (origValue instanceof Error) {
		return origValue
	}

	const type = Array.isArray(origValue) ? 'array' : typeof origValue;
	const baseErr: BaseError = {
		name: 'BaseError',
		message: `Caught exotic value (${type})`,
		origValue: origValue
	}
	if (typeof origValue?.toString !== 'function') {
		return baseErr;
	}

	const newMsg = origValue.toString();

	if (typeof newMsg !== 'string') {
		return baseErr;
	}

	baseErr.message += `: ${newMsg}`;
	return baseErr
}

/**
 *  @description Error-like wrapper for non-Error values caught by resultify and fromPromise.
 */
interface BaseError extends Error {
	/**
	 * @description exotic value that was thrown
	 */
	origValue: unknown;
}
