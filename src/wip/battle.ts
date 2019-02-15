export type Perspective = 'player' | 'observer';

// NOTE: Battle is always delivered such that P1 = player, even though server
// might think otherwise!
abstract class Battle<F extends Field, P1 extends Side, P2 extends Side> {
  // P1's perspective
  readonly perspective: Perspective;

   // Perspective-agnostic
  readonly format: Format;
  state: 'team'|'move'|'switch';
  abilityOrder: number;
  turn: number;
  lastMove?: ID;


  // Field from the perspect of P1
  readonly field: F;

  // P1's side from the perspective of P1
  readonly p1: P1;

  // P2's side from the perspective of P1
  readonly p2: P2;

  // The last damage in the battle from the perspective of P1
  abstract lastDamage(): number|undefined;

  instantiate(): state.Battle {
    return {
      format: this.format,
      field: this.field.instantiate(),
      p1: this.p1.instantiate(),
      p2: this.p2.instantiate(),
      state: this.state,
      turn: this.turn,
      abilityOrder: this.abilityOrder,
      lastMove: this.lastMove,
      lastDamage: this.lastDamage(),
    }
  }
}

//class PlayerObservedBattle extends Battle<ObservedField, PlayerSide, ObservedSide> {
//}

//class PlayerPerceivedBattle extends Battle<PerceivedField, PlayerSide, PerceivedSide> {
//}

//class SpectatorBattle extends battle<ObservedField, ObservedSide, ObservedSide> {
}

// PlayerBattle<ObservedField, PlayerSide, ObservedSide>
// SpectatorBattle<SpectatedField, ObservedSide, ObservedSide>
// 'Observed' could alternatively be 'Perceived' if we add knowledge!


abstract class PersistentEffect<S, T, P extends Pokemon> {
  // P1's perspective
  readonly perspective: Perspective;

  // Perspective-agnostic
  type: T;
  id: ID;
  sourcePosition?: number;


  // Pokemon from P1's perspective
  // (eg. Illusion or no Species Clause could confuse this)
  source?: P; // TODO could be Player or Observed depending on side originated from, not just perspective!

  // Duration from P1's perspective.
  abstract duration(): number|undefined;

  instantiate(): S {
    return {
      type: this.type,
      id: this.id,
      sourcePosition: this.sourcePosition,
      source: this.source.instantiate(),
      duration: this.duration(),
    }
  }
}

abstract class TerrainData<P extends Pokemon> extends PersistentEffect<state.TerrainData, state.Terrain, P> {}

abstract class WeatherData<P extends Pokemon> extends PersistentEffect<state.WeatherData, state.Weather, P> {}

abstract class PseudoWeatherData<P extends Pokemon> extends PersistentEffect<state.PseudoWeatherData, state.PseudoWeather, P> {
  multiplier?: number;

  instantiate(): state.PseudoWeatherData {
    const effect = super.instantiate();
    effect.multiplier = this.multilpier;
    return effect;
  }
}

abstract class Field<T, W, PW> {
  // P1's perspective
  readonly perspective: Perspective;

  terrain?: T;
  weather?: W;
  pseudoWeather: {[id: string]: PW} = {};

  instantiate(): state.Field {
    const pw: {[id: string]: state.PseudoWeather} = {};
    for (const id in pseudoWeather) {
      pw[id] = pseudoWeather[id].instantiate();
    }

    return {
      terrain: this.terrain.instantiate(),
      weather: this.weather.instantiate(),
      pseudoWeather: Objects.keys(pw).length ? pw : undefined,
    }
  }
}


abstract class SideConditionData<P extends Pokemon> extends PersistentEffect<state.SideConditionData, state.SideCondition, P> {
}




}
