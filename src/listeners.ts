import {Params} from './parser';

export type Listener = (params: Params) => boolean|void;

export class Listeners {
  private readonly listeners: {[cmd: string]: Listener[]} = {};

  send(params: Params) {
    const cmd = params.args[0];

    const listeners = this.listeners[cmd];
    if (!listeners) return;

    for (const listener of listeners) {
      listener.call(null, params);
    }
  }

  on(cmd: string, listener: Listener) {
    let listeners = this.listeners[cmd];
    if (!listeners) {
      listeners = (this.listeners[cmd] = []);
    }

    listeners.push(listener);
  }

  off(cmd: string, listener: Listener): boolean {
    const listeners = this.listeners[cmd];
    if (!listeners) return false;

    const i = listeners.indexOf(listener);
    if (i < 0) return false;

    listeners.splice(i, 1);
    return true;
  }
}
