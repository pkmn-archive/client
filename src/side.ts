import * as state from '@pkmn.cc/state';
import {Team} from '@pkmn.cc/data';

export type PlayerDetails = {
  name: string;
  avatar: string;
  team?: Team;
  pokes: {details: string, item: boolean}[];
  teamsize?: number;
};

export class Side implements state.Side {
  readonly pokemon: Pokemon[];
  constructor(battleState: 'team'|'move', player: PlayerDetails) {
    this.state = battleState;
    this.pokemon = initializePokemon(player);
    this.conditions = {};
    this.fainted = {lastTurn: false, thisTurn: false};
  }

  toJSON() {
    return JSON.stringify({
      state: this.state,
      pokemon: this.pokemon.map(p => p.toJSON()),
      active: this.active,
      conditions: Objects.keys(this.conditions).length ? this.conditions : undefined,
      fainted: this.fainted,
      lastMove: this.lastMove,
      zMoveUsed: this.zMoveUsed,
    });
  }

  private static initializePokemon(player: PlayerDetails) {
    let pokemon: Pokemon = [];
    if (player.team) {
      for (const set of team.team) {
        pokemon.push(Pokemon.fromSet(set));
      }
    } else if (player.pokes) {
      for (const poke of player.pokes) {
        pokemon.push(Pokemon.fromDetails(poke.details, poke.item));
      }
    }

    return pokemon;
  }
}
