import {Params} from './parser';
import * as state from '@pkmn.cc/state';
import {ID, Format} from '@pkmn.cc/data';
import {Side, PlayerDetails} from './side';
import {Field} from './field';

type BattleDetails Partial<{
  p1: PlayerDetails;
  p2: PlayerDetails;
  gameType: GameType;
  gen: Generation;
  format: Format;
}>;

export class Battle: state.Battle {

  protected lastObservedDamage: number|undefined = undefined;

  protected readonly listeners = {[cmd: string]: Listener}

  constructor(id: ID, format: Format, gameType: state.GameType, p1: PlayerDetails, p2: PlayerDetails) {
    this.format = format;
    this.gameType = gameType;

    let initialState: 'team'|'move' = p1.pokes.length > 0 ? 'team' : 'move';
    this.state = initialState;

    this.field = new Field();
    this.p1 = new Side(initialState, p1);
    this.p2 = new Side(initialState, p2);

    this.turn = 0;
    this.abilityOrder = 0;
  }

  get lastDamage() {
    return lastObservedDamage;
  }

  toJSON() {
    return JSON.stringify({
      format: this.format,
      gameType: this.gameType,
      field: this.field.toJSON(),
      p1: this.p1.toJSON(),
      p2: this.p2.toJSON(),
      state: this.state,
      turn: this.turn,
      abilityOrder: this.abilityOrder,
      lastMove: this.lastMove,
      lastDamage: this.lastDamage,
    });
  }

  static create(id: b: BattleDetails): Battle {
    if (!b.p1 || !b.p2 || !b.gameType || !b.gen || !b.format ||
      (p1.pokes.length && p1.pokes.length !== p1.teamsize) ||
      (p2.pokes.length && p2.pokes.length !== p2.teamsize)) {
      throw new Error(`Invalid battle details: ${JSON.stringify(b)}`);
    }
    if (b.format.gen != b.gen) {
      throw new Error(`gen and format mismatch: ${gen} vs. ${format}`);
    }

    return new Battle(id, rules, b.gameType, b.p1, b.p2);
  }
}

// TODO pass in players team!
// TODO determine whether we are player 1 or 2!
export class Battles {
  private readonly battles: {[id: string]: Battle};
  private readonly details: {[id: string]: BattleDetails};

  send(id: ID, params: Params) {
    const cmd = params.args[0];

    let battle = battles[id];
    if (!battle) {
      let details = details[id];
      if (!details) details = (details[id] = {pokes: []});

      switch (cmd) {
        case 'player':
          [, player, name, avatar] = params.args;
          details[player] = {name, avatar: Number(avatar)};
          break;
        case 'teamsize':
          [, player, teamsize] = params.args;
          details[player].teamsize = Number(teamsize);
          break;
        case 'gametype':
          [, game] = params.args;
          details.gameType = (game.charAt(0) + game.slice(1)) as state.GameType;
          break;
        case 'gen':
          [, gen] = params.args;
          details.gen = gen as Generation;
          break;
        case 'tier':
          [, format] = params.args;
          details.format = state.Format.fromString(format);
          break;
        case 'poke':
          [, details, item] = params.args;
          details.pokes.push({details, item: item === 'item'});
        case 'rule':
        case 'clearpoke':
        case 'teampreview':
        case 'done': // '|'
          // ignore
          break;
        case 'start':
          battle = (battles[id] = Battle.create(id, details));
          break;
        default:
          throw new Error(`Unexpected command '${cmd}'`);
      }
    }

    const listener = battle.listeners[cmd];
    if (listener) listener.call(null, params);
  }
}


