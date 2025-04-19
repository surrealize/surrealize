export type EventListener<TArgs extends readonly any[] = any[]> = (
  ...args: TArgs
) => void;

export type EventUnsubscriber = () => void;

export class EventEmitter<TEvents extends Record<string, any[]>> {
  #listeners: Map<PropertyKey, Set<EventListener>> = new Map();

  on<TEvent extends keyof TEvents>(
    event: TEvent,
    listener: EventListener<TEvents[TEvent]>,
  ): EventUnsubscriber {
    let listeners = this.#listeners.get(event);

    if (!listeners) {
      listeners = new Set();
      this.#listeners.set(event, listeners);
    }

    listeners.add(listener);

    return () => this.off(event, listener);
  }

  once<TEvent extends keyof TEvents>(
    event: TEvent,
    listener: EventListener<TEvents[TEvent]>,
  ) {
    const wrappedListener: EventListener<TEvents[TEvent]> = (...args) => {
      this.off(event, wrappedListener);
      listener(...args);
    };

    return this.on(event, wrappedListener);
  }

  off<TEvent extends keyof TEvents>(
    event: TEvent,
    listener: EventListener<TEvents[TEvent]>,
  ): void {
    const listeners = this.#listeners.get(event);
    if (!listeners) return;
    const deleted = listeners.delete(listener);
    if (deleted && listeners.size === 0) this.#listeners.delete(event);
  }

  emit<TEvent extends keyof TEvents>(
    event: TEvent,
    ...args: TEvents[TEvent]
  ): void {
    const listeners = this.#listeners.get(event);
    if (!listeners) return;

    for (const listener of listeners) {
      listener(...args);
    }
  }

  waitNext<TEvent extends keyof TEvents>(
    event: TEvent,
    signal?: AbortSignal,
  ): Promise<TEvents[TEvent]> {
    return new Promise<TEvents[TEvent]>((resolve, reject) => {
      let fulfilled = false;

      signal?.addEventListener("abort", () => {
        if (fulfilled) return;

        unsubscribe();
        reject(signal.reason);
      });

      const unsubscribe = this.once(event, (...args) => {
        fulfilled = true;
        resolve(args);
      });
    });
  }
}
