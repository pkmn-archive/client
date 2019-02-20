export interface StatusData {
  type: Status;
  counter?: number;  // PERCEIVE: range
  duration?: number;  // UNKNOWN: can determine max.
  skipped?: number;
  source?: Pokemon;
}
