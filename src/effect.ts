import {ID} from '@pkmn.cc/data';

import {Pokemon, Identifier} from './pokemon';
import {Perspective} from './perspective';

export interface PersistentEffect<T> {
  readonly perspective: Perspective;

  type: T;
  id: ID;
  sourcePosition?: number;
  
  source?: Identifier<Pokemon>;

  duration?: number;
}
