import {Params} from './parser';

export type Listeners = {
  [cmd: string]: Listener
};
type Listener = (params: Params) => void;
