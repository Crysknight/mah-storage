import { AnyRecord } from '../types';
import { arrayDelete } from './';

type ListenersArray = Array<Function>;
type Listeners = AnyRecord<ListenersArray>;
export default class Dispatcher {
    protected readonly _listeners: Listeners = {};

    $subscribe(eventName: string, func: Function) {
        if (!this._listeners[eventName]) {
            this._listeners[eventName] = [];
        }

        this._listeners[eventName].push(func);
    }

    $unsubscribe(eventName: string, func: Function) {
        if (this._listeners[eventName]) {
            arrayDelete(this._listeners[eventName], func);
        }
    }

    $dispatch(eventName: string, ...args: Array<any>) {
        if (this._listeners[eventName]) {
            this._listeners[eventName].forEach(listener => {
                listener.apply(this, [...args]);
            });
        }
    }
}