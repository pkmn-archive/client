import {Battles} from './battle';
import {Listeners} from './listeners';
import {Parser} from './parser';
import {ID, toID} from '@pkmn.cc/data';

export abstract class Client {
  protected readonly listeners: Listeners;
  protected readonly battles: Battles;

  constructor() {
    this.listeners = new Listeners();
    this.battles = new Battles();
  }

  protected onMessage(msg: string) {
    const lines = msg.split('\n');
    const id: ID|undefined =
      (lines[0].charAt(0) === '>') ? toID(lines[0].slice(1)) : undefined;

    for (const line of lines) {
      const params = Parser.parseLine(line);
      if (!params.args[0]) continue;
      if (id) {
        this.battles.send(id, params);
      }
      this.listeners.send(params);
    }
  }

  protected onError(err: Error) {
    throw err;
  }

  send(msg: string) {}

  destroy() {}
}
