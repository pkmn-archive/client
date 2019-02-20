// PERCEIVE: choicelock / lifeorb / metronome need to be inferred based on item.
export type VolatileStatus = ID&{__isVolatile: true};

export interface VolatileStatusData extends PersistentEffect<VolatileStatus> {
  multiplier?: number;
  hitCount?: number;
  layers?: number;
  position?: number;
  hit?: boolean;
  counter?: number;
  locked?: Pokemon;
  lostFocus?: boolean;
  typeWas?: Type;
  move?: ID;
  lastMove?: ID;
  numConsecutive?: number;

  lockedDuration?: number;  // PERCEIVE: range.
  time?: number;  // PERCEIVE: range.
  hp?: number;  // PERCEIVE: 1/4 of inferred source's HP stat.
  damage?: number;  // PERCEIVE: range from damage formula.
}
