import exp_parser, { ParserContext } from "./exp_parser/mod.ts";

let context: ParserContext = {
  debug: false,
  vars: {
    "prev.selected": 0,
  },
  fns: {
    "log": () => console.log(this),
    "goto.bind": (str = "oi") => () => console.log({ going_to: str }),
    // deno-lint-ignore no-explicit-any
    "when": (val: any, cases: any[]) => {
      for (let [k, v] of cases) {
        if (val === k) {
          v.call();
        }
      }
    },
  },
};

exp_parser(
  `
    when(prev.selected, [
      [0, goto.bind('Im going to page 1')],
      [1, goto.bind('Im going to page 2')],
      [2, goto.bind('Im going to page 3')]
    ])
  `,
  context,
);
