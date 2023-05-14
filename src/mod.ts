import parser from "./parser/parser.ts";

console.log(
  parser("34 + 35 + Math.random()", {
    fns: {
      "Math.random": () => 1,
    },
  }),
);
