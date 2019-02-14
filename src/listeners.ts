import {Params} from './parser';

export type Listener = (params: Params) => void;

export class Listeners {
  readonly listeners: {[cmd: string]: Listener[]} = {};

  relay(params: Params) {
    const cmd = params.args[0];

    const listeners = this.listeners[cmd];
    if (!listeners) return;

    for (const listener of listeners) {
      listener.call(null, params);
    }
  }

  subscribe(cmd: string, listener: Listener) {
    let listeners = this.listeners[cmd];
    if (!listeners) {
      listeners = (this.listeners[cmd] = []);
    }

    listeners.push(listener);
  }

  unsubscribe(cmd: string, listener: Listener): boolean {
    const listeners = this.listeners[cmd];
    if (!listeners) return false;

    const i = listeners.indexOf(listener);
    if (i < 0) return false;

    listeners.splice(i, 1);
    return true;
  }
}
