/**
 * A event listener with a type-safe argument list.
 */
export type EventListener<TArgs extends unknown[] = unknown[]> = (
	...args: TArgs
) => void;

/**
 * A function to unsubscribe from an event.
 */
export type Unsubscriber = () => void;

/**
 * An EventEmitter which can be used to emit and listen to typed events.
 */
export class EventEmitter<
	TEvents extends Record<string, unknown[]> = Record<string, unknown[]>,
> {
	private listeners: Map<keyof TEvents, Set<EventListener>> = new Map();

	/**
	 * Register a listener for an event.
	 *
	 * @param event The event to listen for.
	 * @param listener The listener to register.
	 * @returns A unsubscribe function to remove the listener.
	 */
	on<TEvent extends keyof TEvents>(
		event: TEvent,
		listener: EventListener<TEvents[TEvent]>,
	): Unsubscriber {
		let eventListeners = this.listeners.get(event);

		// create a new set if none exists
		if (!eventListeners) {
			eventListeners = new Set();
			this.listeners.set(event, eventListeners);
		}

		// add the listener to the set
		eventListeners.add(listener as EventListener);

		// return a unsubscribe function to remove the listener
		return () => this.off(event, listener);
	}

	/**
	 * Register a listener for an event that is only called once and then removed.
	 *
	 * @param event The event to listen for.
	 * @param listener The listener to register.
	 * @returns A unsubscribe function to remove the listener.
	 */
	once<TEvent extends keyof TEvents>(
		event: TEvent,
		listener: EventListener<TEvents[TEvent]>,
	): Unsubscriber {
		let called = false;

		// create a listener which forwards the event to the original
		// listener and then removes itself after the first event
		const wrappedListener = (...args: TEvents[TEvent]) => {
			// remove the listener after the first event
			this.off(event, wrappedListener);

			// do not call the listener if it was already called
			if (called) return;

			// forward the event to the original listener
			listener(...args);

			// remember that the listener was called
			called = true;
		};

		// subscribe to the event
		this.on(event, wrappedListener);

		// return a unsubscribe function
		return () => this.off(event, wrappedListener);
	}

	/**
	 * Unregister a listener for an event.
	 *
	 * @param event The event to listen for.
	 * @param listener The listener to unregister.
	 * @returns Whether the listener was removed or not.
	 */
	off<TEvent extends keyof TEvents>(
		event: TEvent,
		listener: EventListener<TEvents[TEvent]>,
	): boolean {
		const eventListeners = this.listeners.get(event);

		// no listener set for this event -> nothing to unsubscribe
		if (!eventListeners) return false;

		// delete the listener from the set and rememeber the result
		const result = eventListeners.delete(listener as EventListener);

		// cleanup if no more listeners
		if (eventListeners.size === 0) this.listeners.delete(event);

		// return the result of the delete operation
		return result;
	}

	/**
	 * Emit an event with the provided arguments.
	 *
	 * @param event The event to emit.
	 * @param args The arguments to pass to the event listeners.
	 * @returns The amount of listeners that were called.
	 */
	emit<TEvent extends keyof TEvents>(
		event: TEvent,
		...args: TEvents[TEvent]
	): number {
		const eventListeners = this.listeners.get(event);

		// if no listeners are registered for this event, do nothing
		if (!eventListeners) return 0;

		let amount = 0;

		// call all listeners with the provided arguments
		eventListeners.forEach((listener) => {
			listener(...args);
			amount++;
		});

		return amount;
	}
}
