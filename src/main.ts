import exp_parser, { ParserContext } from "./exp_parser/mod.ts";

let std = {
  "print": (n: any) => console.log(`%c${n}`, "color: blue; font-weight: bold"),
  "print!": (n: any) => () => std.print(n),
  "when": (val: any, cases: any[]) => {
    for (let [k, v] of cases) {
      if (val === k) {
        let value = typeof v === "function" ? v.call() : v;
        return value;
      }
    }
  },
};

let context: ParserContext = {
  vars: { PI: 3.14, value: 10, shape: "circle" },
  fns: std,
};

let decoder = new TextDecoder("utf-8");
let data = Deno.readFileSync("data.txt");
let src = decoder.decode(data);

exp_parser(src, context);
