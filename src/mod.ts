import parser from "./parser/parser.ts";

console.log(
  parser("rand() + x", {
    vars: {
      x: 10,
    },
    fns: {
      "rand": () => Math.ceil(Math.random() * 10),
    },
  }),
);
