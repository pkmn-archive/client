export type Params = {
  cmd: string; args: Args, kwArgs: KWArgs
};
export type Args = string[];
export type KWArgs = {
  [kw: string]: string
};

export class Parser {
  static * parse(buf: string): IterableIterator<Params> {
    for (const line of buf.split('\n')) {
      yield Parser.parseLine(line);
    }
  }

  private static parseLine(line: string): Params {
    if (!line.startsWith('|')) return {cmd: '', args: [line], kwArgs: {}};
    if (line === '|') return {cmd: 'done', args: [], kwArgs: {}};

    const args = line.slice(1).split('|');
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

    return {cmd: args[0], args: args.slice(1), kwArgs};
  }
}
