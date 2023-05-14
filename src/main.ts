import exp_parser, { ParserContext } from "./exp_parser/mod.ts";

let context: ParserContext = {
  debug: true,
  vars: {
    MAGIC_NUMBER: 3.3,
  },
  fns: {
    floor: Math.floor,
    doubleIt: (n: number) => n * 2,
  },
};

console.log(exp_parser("3 - 3 - floor(doubleIt(MAGIC_NUMBER))", context));
