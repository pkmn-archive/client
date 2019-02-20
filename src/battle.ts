import {Format, ID, Team, toID} from '@pkmn.cc/data';

import {Listeners} from './listeners';
import {Params, Parser} from './parser';
import {Perspective} from './perspective';
import {Player} from './side';
import {Stream} from './stream';
import {Timer} from './timer';

type Builder = Partial<{format: Format; p1: Player; p2: Player;}>;

export class Battle {
  readonly listeners: Listeners = {};
  readonly timer: Timer;

  // readonly field: Field;
  // readonly p1: Side;
  // readonly p2: Side;

  state: 'team'|'move'|'switch'|'done';
  abilityOrder: number;
  turn: number;
  lastMove?: ID;

  lastDamage: number|undefined;

  private constructor(
      readonly id: ID, readonly format: Format, readonly perspective: Perspective, p1: Player, p2: Player) {
    this.timer = new Timer(this.listeners, toID(p1.name));

    this.id = id;
    this.format = format;
    this.perspective = perspective;

    const initialState: 'team'|'move' = p1.pokes.length > 0 ? 'team' : 'move';
    this.state = initialState;
    this.turn = 0;
    this.abilityOrder = 0;

    // TODO field/p1/p2/timer
  }

  // TODO need to include COMMANDS (ie/ so that we know team order etc!)?
  update (buf: string) { 
    for (const params of Parser.parse(buf)) {
      const listener = this.listeners[params.cmd];
      if (listener) listener.call(null, params);
    }
  }

  static async create(id: ID, s: Stream, player?: {name: string, team: Team}):
      Promise<Battle|null> {
    const b: Builder = {};

    let buf;
    while ((buf = await s.read())) {
      for (const params of Parser.parse(buf)) {
        switch (params.cmd) {
          case 'player': {
            const [side, name, avatar] =
                params.args as ['p1' | 'p2', string, string];
            b[side] = {side, name, avatar, pokes: []};
            break;
          }
          case 'teamsize': {
            const [side, teamsize] = params.args as ['p1' | 'p2', string];
            b[side]!.teamsize = Number(teamsize);
            break;
          }
          case 'tier':
            // NOTE: 'gametype' and 'gen' already encoded in format
            const [format] = params.args;
            b.format = Format.fromString(format);
            break;
          case 'poke': {
            const [side, details, item] =
                params.args as ['p1' | 'p2', string, string];
            b[side]!.pokes.push({details, item: item === 'item'});
            break;
          }
          case 'start':
            if (!b.p1 || !b.p2 || !b.format) return null;

            const perspective: Perspective = player ? 'player' : 'spectator';
            let [p1, p2] = [b.p1, b.p2];
            if (player) {
              if (toID(player.name) === toID(p1.name)) {
                p1.team = player.team;
              } else if (toID(player.name) === toID(p2.name)) {
                // Swap so that from the player's perspective they are always
                // p1.
                [p1, p2] = [b.p2, b.p1];
                p1.team = player.team;
              } else {
                // If the player param was used by the player is not a
                // participant then something is wrong.
                return null;
              }
            }
            // TODO: verify teamsizes match pokes and pokes match provided team?
            return new Battle(id, b.format, perspective, p1, p2);
          default:  // ignore
        }
      }
    }
    return null;
  }
}
