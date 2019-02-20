import {BoostsTable, ID, PokemonSet, StatsTable, Status, Type, Gender} from '@pkmn.cc/data';

import {PersistentEffect} from './effect';

export interface MoveSlot {
  move: ID;
  pp: number;
  maxpp: number;
  used?: boolean;
  virtual?: boolean;
  disabled: boolean|'hidden';  // PERCEIVE: can determine hidden if moves shown.
}

export type MoveResult = 'skipped'|'failure'|'success';

interface Details {
  position?: string; // TODO might be in the party!
  name: string;
  species: string; 

  item?: boolean;

  shiny?: boolean;
  gender?: Gender;
  level?: number;

  hp?: string;
  status?: Status;

  key: string; // TODO serialize details to string - position might change if rotated? how to track?
}

export type Identifier<T> = number;

export interface Pokemon {
  readonly identifier: Identifier<Pokemon>;

  // TYPE 1
  boosts: BoostsTable;
  status?: StatusData;
  volatiles?: {[id: string]: VolatileStatusData};  // PERCEIVE
  activeTurns?: number;
  abilityOrder: number;
  transformed?: boolean;
  busted?: boolean;
  maybeTrapped?: boolean;
  maybeDisabled?: boolean;
  draggedIn?: number;
  usedItemThisTurn?: boolean;
  lastItem?: ID;
  ateBerry?: boolean;
  hurtThisTurn: boolean;
  subFainted?: boolean;
  newlySwitched?: boolean;
  addedType?: Type;
  moveSlots: MoveSlot[];  // PERCEIVE
  trapped: boolean|'hidden';  // PERCEIVE
  attackedBy: Array<{
    source: Pokemon; damage: number;  // PERCEIVE: range
    thisTurn: boolean;
    move?: ID;
  }>;

  moveResult?: {lastTurn?: MoveResult, thisTurn?: MoveResult};

  // TODO: do we know if sleeping and the move failed?
  moveThisTurn?: ID;
  lastMove?: ID;
 
  megaEvo?: ID;  // PERCEIVE
  ultraBurst?: ID;  // PERCEIVE
  illusion?: Pokemon;  // ???
  lastDamage?: number;  // PERCEIVE

  // DETAILS --------------------
  details: Details;
  set: Partial<PokemonSet>;  // PERCEIVE
  species: ID;
    type1: Type;
    type2?: Type;
    weight: number;  // PERCEIVE: calculate
    stats: StatsTable;  // PERCEIVE
    modifiedStats?: StatsTable;  // PERCEIVE
    original: {ability: ID, stats: StatsTable, moveSlots: MoveSlot[]};  // PERCEIVE

  hp: number;  // PERCEIVE: deduce from inferred stats and percentage.

  item?: ID;  // PERCEIVE
  ability?: ID;  // PERCEIVE
  hpType?: Type;     // PERCEIVE
  hpPower?: number;  // PERCEIVE
}

