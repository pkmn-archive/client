## Battle

### Initialization

    |player|p1|Anonycat|60
    |player|p2|Anonybird|113
    |teamsize|p1|4
    |teamsize|p2|5
    |gametype|doubles
    |gen|7
    |tier|[Gen 7] Doubles Ubers
    |rule|Species Clause: Limit one of each Pokémon
    |rule|OHKO Clause: OHKO moves are banned
    |rule|Moody Clause: Moody is banned
    |rule|Evasion Abilities Clause: Evasion abilities are banned
    |rule|Evasion Moves Clause: Evasion moves are banned
    |rule|Endless Battle Clause: Forcing endless battles is banned
    |rule|HP Percentage Mod: HP is shown in percentages
    |clearpoke
    |poke|p1|Pikachu, L59, F|item
    |poke|p1|Kecleon, M|item
    |poke|p1|Jynx, F|item
    |poke|p1|Mewtwo|item
    |poke|p2|Hoopa-Unbound|
    |poke|p2|Smeargle, L1, F|item
    |poke|p2|Forretress, L31, F|
    |poke|p2|Groudon, L60|item
    |poke|p2|Feebas, L1, M|
    |teampreview
    |
    |start

-   wait for all data before creating Battle object
-   if P1 or P2 is the current username then we create a battle from the
    player's perspective
    -   if player battle, use most recent team set from `/utm`.
-   **NOTE:** can have spurious 'j'/'c'/etc messages as well, not one block

##### player (DONE)

`|player|PLAYER|USERNAME|AVATAR`

> Player details.
>
> -   `PLAYER` is `p1` or `p2`
> -   `USERNAME` is the username
> -   `AVATAR` is the player's avatar identifier (usually a number, but other
>     values can be used for custom avatars)

-   compare to the authenticated user's username to determine whether the user
    is P1 or P2.

##### teamsize (DONE)

`|teamsize|PLAYER|NUMBER`

> -   `PLAYER` is `p1` or `p2`
> -   `NUMBER` is the number of Pokémon your opponent starts with. In games
>     without Team Preview, you don't know which Pokémon your opponent has, but
>     you at least know how many there are.

-   determines the number of Pokemon on the side (fill in `undefined` for
    unrevealed?).

##### gametype (DONE)

`|gametype|GAMETYPE`

> -   `GAMETYPE` is `singles`, `doubles`, or `triples`.

-   should be inferrable from Format.

##### gen (DONE)

`|gen|GENNUM`

> Generation number, from 1 to 7. Stadium counts as its respective gens; Let's
> Go counts as 7, and modded formats count as whatever gen they were based on.

-   should be inferrable from Format.

##### tier (DONE)

`|tier|FORMATNAME`

> The name of the format being played.

-   the Format being played.

##### rated (DONE)

`|rated`

> Will be sent if the game will affect the player's ladder rating (Elo score).

`|rated|MESSAGE`

> Will be sent if the game is official in some other way, such as being a
> tournament game. Does not actually mean the game is rated.

-   ignore.

##### rule (DONE)

`|rule|RULE: DESCRIPTION`

> Will appear multiple times, one for each

-   ignore (rely on predefined rules instead).

##### start (DONE)

`|start`

> Indicates that the game has started.

-   actually initialize the battle
-   state is `'preview'` if there was Team Preview, otherwise `'move'`.

#### Team Preview

    |clearpoke
    |poke|PLAYER|DETAILS|ITEM
    |poke|PLAYER|DETAILS|ITEM
    ...
    |teampreview

> These messages appear if you're playing a format that uses team previews.

##### clearpoke (DONE)

`|clearpoke`

> Marks the start of Team Preview

-   ignore.

##### poke (DONE)

`|poke|PLAYER|DETAILS|ITEM`

> Declares a Pokémon for Team Preview.
>
> -   `PLAYER` is the player ID (see `|player|`)
> -   `DETAILS` describes the pokemon (see "Identifying Pokémon" below)
> -   `ITEM` will be `item` if the Pokémon is holding an item, or blank if it
>     isn't.
>
> Note that forme and shininess are hidden on this, unlike on the `|switch|`
> details message.

-   used to initialize side's Pokemon if no Team.

##### teampreview (DONE)

`|teampreview`

> Marks the end of Team Preview

-   ignore.

### Progress

##### done (DONE)

`|`

> Clears the message-bar, and add a spacer to the battle history. This is
> usually done automatically by detecting the message-type, but can also be
> forced to happen with this.

-   ignore.

##### request

`|request|REQUEST`

> Gives a JSON object containing a request for a choice (to move or switch). To
> assist in your decision, `REQUEST.active` has information about your active
> Pokémon, and `REQUEST.side` has information about your your team as a whole.
> `REQUEST.rqid` is an optional request ID (see "Sending decisions" for
> details).

-   **TODO:** what information we don't have from the other messages?

##### inactive/inactiveoff

`|inactive|MESSAGE` or `|inactiveoff|MESSAGE`

> A message related to the battle timer has been sent. The official client
> displays these messages in red.
>
> `inactive` means that the timer is on at the time the message was sent, while
> `inactiveoff` means that the timer is off.

-   Side objects need a local timer PROVIDED the battle is live (for replays no
    point in initializing!)
-   message looks like `"Time left: "` or `"You have "` or `" seconds left."`
-   message can be compared to local timer - some skew is expected, but should
-   track lag and potentially update local timer to match?

##### turn

`|turn|NUMBER`

> It is now turn `NUMBER`.

-   update turn in Battle object.

##### upkeep

`|upkeep`

> End of turn upkeep is performed (Toxic, Pseudo Weather).

-   **TODO:** can we ignore and just use turn instead?
-   update toxic and field.pseudoWeather

##### win/tie

`|win|USER`

> `USER` has won the battle.

`|tie`

> The battle has ended in a tie.

-   both of these end the battle.
-   care about who won or lost when performing playouts/replay.

### Actions

##### move

`|move|POKEMON|MOVE|TARGET`

> The specified Pokémon has used move `MOVE` at `TARGET`. If a move has multiple
> targets or no target, `TARGET` should be ignored. If a move targets a side,
> `TARGET` will be a (possibly fainted) Pokémon on that side.
>
> If `|[miss]` is present, the move missed.
>
> If `|[still]` is present, the move should not animate
>
> `|[anim] MOVE2` tells the client to use the animation of `MOVE2` instead of
> `MOVE` when displaying to the client.

-   ignore kwargs.anim and kwArgs.still
-   Pokemon's lastMoveResult.thisTurn = 'failure' if kwArgs.miss
-   battle's lastMove does not get updated on miss
-   update Pokemon's lastMove (and moveThisTurn?)

##### switch/drag

`|switch|POKEMON|DETAILS|HP STATUS` or `|drag|POKEMON|DETAILS|HP STATUS`

> A Pokémon identified by `POKEMON` has switched in (if there was an old Pokémon
> in that position, it is switched out).
>
> For the DETAILS format, see "Identifying Pokémon" above.
>
> `POKEMON|DETAILS` represents all the information that can be used to tell
> Pokémon apart. If two pokemon have the same `POKEMON|DETAILS` (which will
> never happen in any format with Species Clause), you usually won't be able to
> tell if the same pokemon switched in or a different pokemon switched in.
>
> The switched Pokémon has HP `HP`, and status `STATUS`. `HP` is specified as a
> fraction; if it is your own Pokémon then it will be `CURRENT/MAX`, if not, it
> will be `/100` if HP Percentage Mod is in effect and `/48` otherwise. `STATUS`
> can be left blank, or it can be `slp`, `par`, etc.
>
> `switch` means it was intentional, while `drag` means it was unintentional
> (forced by Whirlwind, Roar, etc).

-   if drag, set Pokemon.draggedIn to Battle.turn
-   **TODO:** calculate identity (update details)
-   if own pokemon, ignore /100 or /48, otherwise use to determine HP accuracy

##### detailschange/-formechange

`|detailschange|POKEMON|DETAILS|HP STATUS` or `|-formechange|POKEMON|SPECIES|HP
STATUS`

> The specified Pokémon has changed formes (via Mega Evolution, ability, etc.)
> to `SPECIES`. If the forme change is permanent (Mega Evolution or a
> Shaymin-Sky that is frozen), then `detailschange` will appear; otherwise, the
> client will send `-formechange`.
>
> Syntax is the same as `|switch|` above.

-   don't need to distinguish between detailschange and -formechange?

##### replace

`|replace|POKEMON|DETAILS|HP STATUS`

> Illusion has ended for the specified Pokémon. Syntax is the same as `|switch|`
> above, but remember that everything you thought you knew about the previous
> Pokémon is now wrong.
>
> `POKEMON` will be the NEW Pokémon ID - i.e. it will have the nickname of the
> Zoroark (or other Illusion user).

-   **TODO:** modify identity (update details)

##### swap

`|swap|POKEMON|POSITION`

> Moves already active `POKEMON` to active field `POSITION` where the leftmost
> position is 0 and each position to the right counts up by 1.

-   ignore (not used in 'singles').

##### cant

`|cant|POKEMON|REASON` or `|cant|POKEMON|REASON|MOVE`

> The Pokémon `POKEMON` could not perform a move because of the indicated
> `REASON` (such as paralysis, Disable, etc). Sometimes, the move it was trying
> to use is given.

##### faint

`|faint|POKEMON`

> The Pokémon `POKEMON` has fainted.

-   update Pokemon's status to faint, hp = 0

##### fail

`|-fail|POKEMON|ACTION`

> The specified `ACTION` has failed against the `POKEMON` targetted. The
> `ACTION` in question can be a move that fails, or a stat drop blocked by an
> ability like Hyper Cutter, in which case `ACTION` will be `unboost|STAT`,
> where `STAT` indicates where the ability prevents stat drops. (For abilities
> that block all stat drops, like Clear Body, `|STAT` does not appear.)

##### -damge

`|-damage|POKEMON|HP STATUS`

> The specified Pokémon `POKEMON` has taken damage, and is now at `HP STATUS`
> (see `|switch|` for details).
>
> If `HP` is 0, `STATUS` should be ignored. The current behavior is for `STATUS`
> to be `fnt`, but this may change and should not be relied upon.

##### -heal

`|-heal|POKEMON|HP STATUS`

> Same as `-damage`, but the Pokémon has healed damage instead.

##### -status/-curestatus/-cureteam

`|-status|POKEMON|STATUS`

> The Pokémon `POKEMON` has been inflicted with `STATUS`.

`|-curestatus|POKEMON|STATUS`

> The Pokémon `POKEMON` has recovered from `STATUS`.

`|-cureteam|POKEMON`

> The Pokémon `POKEMON` has used a move that cures its team of status effects,
> like Heal Bell.

##### -boost/-unboost/...

`|-boost|POKEMON|STAT|AMOUNT`

> The specified Pokémon `POKEMON` has gained `AMOUNT` in `STAT`, using the
> standard rules for Pokémon stat changes in-battle. `STAT` is a standard
> three-letter abbreviation fot the stat in question, so Speed will be `spe`,
> Special Defense will be `spd`, etc.

`|-unboost|POKEMON|STAT|AMOUNT`

> Same as `-boost`, but for negative stat changes instead.

`|-setboost|POKEMON|STAT|AMOUNT|[from] EFFECT`

> Like `-boost`, but set boost to exactly amount thanks to EFFECT (Belly Drum,
> Anger Point).

`|-clearboost|POKEMON`

> Clears all boosts of the target `POKEMON` (Clear Smog).

`|-clearpositiveboost|POKEMON|OFPOKEMON|EFFECT`

> Clears all positive boosts from `POKEMON` (Spectral Thief).

`|-clearnegativeboost|POKEMON`

> Clears all negative boosts of the target `POKEMON` (zMoves, White Herb)

`|-clearallboost`

> Clears all boosts on both sides of the field.

`|-swapboost|POKEMON1|POKEMON2|STATS, ...|[from]: EFFECT`

> Swaps boosts for `STATS` (eg. 'atk, def, evasion') between `POKEMON1` and
> `POKEMON2` because of `EFFECT`. (Guard Swap/Heart Swap/Power Swap).

`|-invertboost|POKEMON|[from] EFFECT`

> Inverts boosts on target `POKEMON` due to `EFFECT` (Topsy-Turvy).

`|-copyboost|SOURCE|TARGET|[from] EFFECT`

> Copy boosts from `SOURCE` Pokemon to `TARGET` Pokemon due to `EFFECT` (Psych
> Up).

##### -singlemove/-singleturn

`|-singlemove|POKEMON|EFFECT`

> (Protect, Focus Punch, Roost, etc)

`|-singleturn|POKEMON|EFFECT`

> (Grudge, Destiny Bond)

##### -weather

`|-weather|WEATHER`

> Indicates the weather that is currently in effect. If `|[upkeep]` is present,
> it means that `WEATHER` was active previously and is still in effect that
> turn. Otherwise, it means that the weather has changed due to a move or
> ability, or has expired, in which case `WEATHER` will be `none`.

-   check for kwargs.upkeep to determine whether to update counter for duration?

##### -fieldstart/-fieldend

`|-fieldstart|CONDITION`

> The field condition `CONDITION` has started. Field conditions are all effects
> that affect the entire field and aren't a weather. (For example: Trick Room,
> Grassy Terrain)

`|-fieldend|CONDITION`

> Indicates that the field condition `CONDITION` has ended.

-   used for both PseudoWeather and Terrain

##### -sidestate/-sideend

`|-sidestart|SIDE|CONDITION`

> A side condition `CONDITION` has started on `SIDE`. Side conditions are all
> effects that affect one side of the field. (For example: Tailwind, Stealth
> Rock, Reflect)

`|-sideend|SIDE|CONDITION`

> Indicates that the side condition `CONDITION` ended for the given `SIDE`.

-   side conditions

##### -crit

`|-crit|POKEMON`

> A move has dealt a critical hit against the `POKEMON`.

##### -supereffective/-resisted

`|-supereffective|POKEMON`

> A move was super effective against the `POKEMON`.

`|-resisted|POKEMON`

> A move was not very effective against the `POKEMON`.

-   can be used to help determine Pokemon's hpType (and IVs in gen < 7)

##### -immune

`|-immune|POKEMON`

> The `POKEMON` was immune to a move.

-   can be used to help determine Pokemon's hpType (and IVs in gen < 7)
-   Pokemon's MoveResult for thisTurn = 'failure'

##### -item/-enditem

`|-item|POKEMON|ITEM`

> The `ITEM` held by the `POKEMON` has been changed or revealed due to a move or
> ability. In addition, Air Balloon reveals itself when the Pokémon holding it
> switches in, so it will also cause this message to appear.

`|-enditem|POKEMON|ITEM`

> The `ITEM` held by `POKEMON` has been destroyed, and it now holds no item.
> This can be because of an item's own effects (consumed Berries, Air Balloon),
> or by a move or ability, like Knock Off. If a berry is consumed, it also has
> an additional modifier `|[eat]` to indicate that it was consumed. This message
> does not appear if the item's ownership was changed (with a move or ability
> like Thief or Trick), even if the move or ability would result in a Pokémon
> without an item.

##### -ability/-endability

`|-ability|POKEMON|ABILITY`

> The `ABILITY` of the `POKEMON` has been changed due to a move/ability, or it
> has activated in a way that could not be better described by one of the other
> minor messages. For example, Clear Body sends `-fail` when it blocks stat
> drops, while Mold Breaker sends this message to reveal itself upon switch-in.
>
> Note that Skill Swap does not send this message despite it changing abilities,
> because it does not reveal abilities when used between allies in a Double or
> Triple Battle.

`|-endability|POKEMON`

> The `POKEMON` has had its ability surpressed, either by a move like Gastro
> Acid, or by the effects of Mummy. DEPRECATED: use `-start` for Gastro Acid and
> the third argument of `-ability` for Entrainment et al.

##### -start/-end

`|-start|POKEMON|EFFECT`

> `|[of] POKEMON` `|[from] EFFECT`

`|-end|POKEMON|EFFECT`

> `|[from] EFFECT`

##### -transform

`|-transform|POKEMON|SPECIES`

> The Pokémon `POKEMON` has transformed into `SPECIES` by the effect of
> Transform or the ability Imposter.

##### -mega/-primal/-burst

`|-mega|POKEMON|MEGASTONE`

> The Pokémon `POKEMON` used `MEGASTONE` to Mega Evolve.

`|-primal|POKEMON`

> The Pokémon `POKEMON` primal evolved.

`|-burst|POKEMON` TODO

> The Pokémon `POKEMON` ultra bursted.

-   burst updates MoveResult.thisTurn = success.

##### -activate

`|-activate|EFFECT`

> A miscellaneous effect has activated. This is triggered whenever an effect
> could not be better described by one of the other minor messages: for example,
> healing abilities like Water Absorb simply use `-heal`, and items that are
> consumed upon use have the `-enditem` message instead.

##### -hint (DONE)

`|-hint|MESSAGE`

> Displays a message in parentheses to the client. Hint messages appear to
> explain and clarify why certain actions, such as Fake Out and Mat Block
> failing, have occurred, when there would normally be no in-game messages.

-   ignore, human consumption only.

##### -center (DONE)

`|-center`

> Appears in Triple Battles when only one Pokémon remains on each side, to
> indicate that the Pokémon have been automatically centered.

-   ignore, Triples only.

##### -message (DONE)

`|-message|MESSAGE`

> Displays a miscellaneous message to the client. These messages are primarily
> used for messages from game mods that aren't supported by the client, like
> rule clauses such as Sleep Clause, or other metagames with custom messages for
> specific scenarios.

-   ignore?

##### -zpower (DONE)

`|-zbroken|POKEMON`

> Indicates that the Pokemon used its zMove.

-   update whether side can still use Z
-   updates item information (know it carries z crystal)
-   also breaks illusion, but we'll get that through -replace!

##### -zbroken (DONE)

`|-zbroken|POKEMON`

> Indicates that the zMove broken through Protect.

-   ignore - can determine from move data and state already.

### Miscellaneous

##### switchout (DONE)

`|switchout|POKEMON` or `|switchout|POKEMON|[from] MOVE`

> Client side action representing that a Pokemon switched out due to Baton Pass
> (first form) orr U-turn/Volt Switch (indicated with `[from]`).

##### prematureend (DONE)

`|prematureend`

> Client side action for when a replay was ended early.

##### callback (DONE)

`|callback|...`

> Used by the client with another action to indicate another choice is required.
> Can occur with `cantz`, `cant`, `cantmega`, `trapped`.

