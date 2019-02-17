// With respect to the true state known only on the server, all client
// Perspectives are 'observers'. However, exactly how much information can be
// gleaned depends on this client Perspective:
//
//   - 'player': the perspective of the player in a battle, where the entire
//   team and player-observable variables (HP, stats, etc) are known.
//   - 'opponent': the player's perspective on their opponent - by making
//   knowledge of the player's own information about the values they can
//   observe, additional information can be inferred about the opponent.
//   - 'spectator': information as observed by a completely independent party
//   with no special knowledge
export type Perspective = 'player'|'opponent'|'spectator';
