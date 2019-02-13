/* tslint:disable:switch-default */
import {ID, toID} from '@pkmn.cc/data';

type Args = [string, ...string[]];
type KWArgs = {
  [kw: string]: string
};

export class Parser {
  static parseLine(line: string): {args: Args, kwArgs: KWArgs} {
    if (!line.startsWith('|')) {
      return {args: ['', line], kwArgs: {}};
    }
    if (line === '|') {
      return {args: ['done'], kwArgs: {}};
    }
    const index = line.indexOf('|', 1);
    const cmd = line.slice(1, index);
    switch (cmd) {
      case 'chatmsg':
      case 'chatmsg-raw':
      case 'raw':
      case 'error':
      case 'html':
      case 'inactive':
      case 'inactiveoff':
      case 'warning':
      case 'fieldhtml':
      case 'controlshtml':
      case 'bigerror':
      case 'debug':
      case 'tier':
        return {args: [cmd, line.slice(index + 1)], kwArgs: {}};
      case 'c':
      case 'chat':
      case 'uhtml':
      case 'uhtmlchange':
        // three parts
        const index2a = line.indexOf('|', index + 1);
        return {
          args: [cmd, line.slice(index + 1, index2a), line.slice(index2a + 1)],
          kwArgs: {}
        };
      case 'c:':
        // four parts
        const index2b = line.indexOf('|', index + 1);
        const index3b = line.indexOf('|', index2b + 1);
        return {
          args: [
            cmd, line.slice(index + 1, index2b),
            line.slice(index2b + 1, index3b), line.slice(index3b + 1)
          ],
          kwArgs: {},
        };
    }
    const args: Args = line.slice(1).split('|') as Args;
    const kwArgs: KWArgs = {};
    while (args.length > 1) {
      const lastArg = args[args.length - 1];
      if (lastArg.charAt(0) !== '[') break;
      const bracketPos = lastArg.indexOf(']');
      if (bracketPos <= 0) break;
      // default to '.' so it evaluates to boolean true
      kwArgs[lastArg.slice(1, bracketPos)] =
          lastArg.slice(bracketPos + 1).trim() || '.';
      args.pop();
    }
    return Parser.upgradeArgs({args, kwArgs});
  }

  static upgradeArgs({args, kwArgs}: {args: Args, kwArgs: KWArgs}):
      {args: Args, kwArgs: KWArgs} {
    switch (args[0]) {
      case '-activate': {
        if (kwArgs.item || kwArgs.move || kwArgs.number || kwArgs.ability) {
          return {args, kwArgs};
        }
        const [, pokemon, effect, arg3, arg4] = args;
        const target = kwArgs.of;
        const id = Parser.effectId(effect);

        if (kwArgs.block) return {args: ['-fail', pokemon], kwArgs};

        if (id === 'wonderguard') {
          return {
            args: ['-immune', pokemon],
            kwArgs: {from: 'ability:Wonder Guard'}
          };
        }

        if ([
              'ingrain',       'quickguard',     'wideguard',
              'craftyshield',  'matblock',       'protect',
              'mist',          'safeguard',      'electricterrain',
              'mistyterrain',  'psychicterrain', 'telepathy',
              'stickyhold',    'suctioncups',    'aromaveil',
              'flowerveil',    'sweetveil',      'disguise',
              'safetygoggles', 'protectivepads',
            ].includes(id)) {
          return {
            args: ['-block', target || pokemon, effect, arg3],
            kwArgs: {}
          };
        }

        if ([
              'bind',
              'wrap',
              'clamp',
              'whirlpool',
              'firespin',
              'magmastorm',
              'sandtomb',
              'infestation',
              'charge',
              'trapped',
            ].includes(id)) {
          return {args: ['-start', pokemon, effect], kwArgs: {of: target}};
        }

        if (id === 'fairylock') {
          return {args: ['-fieldactivate', effect], kwArgs: {}};
        }

        if (id === 'symbiosis') {
          kwArgs.item = arg3;
        } else if (id === 'magnitude') {
          kwArgs.number = arg3;
        } else if (id === 'skillswap' || id === 'mummy') {
          kwArgs.ability = arg3;
          kwArgs.ability2 = arg4;
        } else if ([
                     'spite', 'grudge', 'forewarn', 'sketch', 'leppaberry',
                     'mysteryberry'
                   ].includes(id)) {
          kwArgs.move = arg3;
          kwArgs.number = arg4;
        }
        args = ['-activate', pokemon, effect, target || ''];
        return {args, kwArgs};
      }

      case 'move': {
        if (kwArgs.from === 'Magic Bounce') {
          kwArgs.from = 'ability:Magic Bounce';
        }
        return {args, kwArgs};
      }

      case '-nothing':
        // OLD: |-nothing
        // NEW: |-activate||move:Splash
        return {args: ['-activate', '', 'move:Splash'], kwArgs};
    }
    return {args, kwArgs};
  }

  static effectId(effect?: string) {
    if (!effect) return '';
    if (effect.startsWith('item:') || effect.startsWith('move:')) {
      effect = effect.slice(5);
    } else if (effect.startsWith('ability:')) {
      effect = effect.slice(8);
    }
    return toID(effect);
  }
}
