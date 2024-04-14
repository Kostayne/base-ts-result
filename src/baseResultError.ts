
/**
 *  @description Type for errors caught by resultify and fromPromise. Thrown non-Error values are converted to Error
 */
export type ResultCaughtError = BaseResultError | Error;
export function thrownUnknownToError(origValue: unknown): ResultCaughtError {
	if (origValue instanceof Error) {
		return origValue
	}
	return new BaseResultError(origValue);

}

/**
 *  @description Base class for errors caught by resultify and fromPromise.
 *               converts non Error values to Error
 */
export class BaseResultError extends Error {
	/**
	 * @description exotic value that was thrown
	 */
	public origValue: unknown;


	constructor(origValue?: unknown) {
		super('');

		this.origValue = origValue;
		this.name = 'BaseResultError';
		const type = Array.isArray(origValue) ? 'array' : typeof origValue;
		this.message = `Caught exotic value (${type})`;

		if (typeof origValue?.toString !== 'function') {
			return;
		}

		const newMsg = origValue.toString();

		if (typeof newMsg !== 'string') {
			return;
		}

		this.message += `: ${newMsg}`;
	}
}
