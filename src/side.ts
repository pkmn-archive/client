import {Team} from '@pkmn.cc/data';

// clang-format off
export type Player = {
  side: 'p1'|'p2'; 
  name: string;
  avatar?: string; 
  pokes: Array<{details: string, item: boolean}>;
  teamsize?: number;
  team?: Team;
};
// clang-format on




class Side {

  // identifier table, pokemon in order seen (or team preview);
  pokemon: Pokemon[] = [];
  lookup: {[key: string]: number}; // lookup identifier for Pokemon, can use to index into Side's pokemon array
  // NOTE: generally, with nickname clause just name is OK, with species clause just species is OK, but without need to do more elaborate checking. Also:
  // ILLUSION causes use to update our mapping - we might have double pointers
  // to a specific pokemon
  
  switchTable: Pokemon[]; // want to know WHICH pokemon are where (after switches) -> cant know for opposing side (would enable us to know illusion though?)

  // TODO combine into 2? or 1?
  // a) each pokemon has an id, can just do a .find(p => p.id == id) lookup instead?
  // b) 



}
