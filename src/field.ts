import * as state from '@pkmn.cc/state';

export class Field implements state.Field {
  constructor() {
    this.pseudoWeather = {};
  }

  toJSON() {
    return JSON.stringify({
      terrain: this.terrain,
      weather: this.weather,
      pseudoWeather: Objects.keys(this.pseudoWeather).length ? this.pseudoWeather : undefined,
    });
  }
}
