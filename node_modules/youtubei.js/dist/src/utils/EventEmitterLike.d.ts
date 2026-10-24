type Listener = (...args: any[]) => void;
export declare class EventEmitterLike<Events extends Record<string, Listener>> {
    private listeners;
    private onceWrappers;
    emit<K extends keyof Events>(type: K, ...args: Parameters<Events[K]>): void;
    on<K extends keyof Events>(type: K, listener: Events[K]): void;
    once<K extends keyof Events>(type: K, listener: Events[K]): void;
    off<K extends keyof Events>(type: K, listener: Events[K]): void;
    removeAllListeners(type?: keyof Events): void;
}
export {};
