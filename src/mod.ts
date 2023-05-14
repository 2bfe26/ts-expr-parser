import jep, { ParserContext } from "./js_exp_parser/mod.ts";

let context: ParserContext = {
  vars: {
    MAGIC_NUMBER: 3.3,
  },
  fns: {
    floor: Math.floor,
    doubleIt: (n: number) => n * 2,
  },
};

console.log(jep("3 - 3 - floor(doubleIt(MAGIC_NUMBER))", context));
