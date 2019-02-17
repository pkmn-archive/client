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
