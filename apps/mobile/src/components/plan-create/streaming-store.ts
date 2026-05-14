/**
 * Pub/sub store for values that change frequently during AI streaming.
 * Subscribers read via `useSyncExternalStore`, so only components that
 * subscribe re-render — keeping the wizard context value stable across
 * token-level updates.
 */
export type StreamingStore<T> = {
	get: () => T;
	set: (next: T) => void;
	subscribe: (listener: () => void) => () => void;
};

export function createStreamingStore<T>(
	initial: T,
	isEqual: (a: T, b: T) => boolean = Object.is,
): StreamingStore<T> {
	let value = initial;
	const listeners = new Set<() => void>();
	return {
		get: () => value,
		set: (next: T) => {
			if (isEqual(value, next)) return;
			value = next;
			listeners.forEach((l) => void l());
		},
		subscribe: (listener: () => void) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
	};
}
