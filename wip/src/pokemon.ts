import * as state from '@pkmn.cc/state';
import {PokemonSet} from '@pkmn.cc/data';

export class Pokemon implements state.Pokemon {

  constructor() {
    this.volatiles = {};
    // TODO hp vs. approxHP


  }

  toJSON() {
    return JSON.stringify({}); // TODO
  }

  static fromSet(set: PokemonSet): Pokemon {
  }

  static fromDetails(details: string, item: boolean) {
  }
}
