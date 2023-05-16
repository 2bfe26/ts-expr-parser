import { Op, OPS_BINARY, OPS_UNARY } from "./eval_ast.ts";

export type Lexer = ReturnType<typeof create_lexer>;

export type Token =
  | { type: "String"; value: string }
  | { type: "Symbol"; value: string }
  | { type: "Op"; value: Op }
  | { type: "ParenStart"; value: "(" }
  | { type: "ParenEnd"; value: ")" }
  | { type: "BracketStart"; value: "[" }
  | { type: "BracketEnd"; value: "]" }
  | { type: "Comma"; value: "," };

export function create_lexer(input: string) {
  let src = input;

  return {
    unnext: (token: Token) => {
      // NOTE: Forgetting to add quotes around the String type token almost gave me an ulcer.
      let value = token.type === "String" ? `"${token.value}"` : token.value;

      src = value + src;
    },

    next: (): Token | null => {
      src = src.trimStart();

      if (!src.length) return null;

      /**
       * NOTE:
       *  This is probably not the responsibility of the lexer,
       *  but I find myself immersed in a sea of melancholy,
       *  navigating through the treacherous waters
       *  of an unforgivable schedule.
       */
      if (src[0].startsWith('"')) {
        src = src.slice(1);
        let acc = "";

        while (src[0] && src[0] !== '"') {
          acc += src[0];
          src = src.slice(1);
        }

        if (src[0] !== '"') {
          throw new TypeError("String is not properly closed by double quote");
        }

        src = src.slice(1);

        return { type: "String", value: acc };
      }

      if (src[0] === "(") {
        src = src.slice(1);
        return { type: "ParenStart", value: "(" };
      }

      if (src[0] === ")") {
        src = src.slice(1);
        return { type: "ParenEnd", value: ")" };
      }

      if (src[0] === "[") {
        src = src.slice(1);
        return { type: "BracketStart", value: "[" };
      }

      if (src[0] === "]") {
        src = src.slice(1);
        return { type: "BracketEnd", value: "]" };
      }

      if (src[0] === ",") {
        src = src.slice(1);
        return { type: "Comma", value: "," };
      }

      if (is_operator(src[0])) {
        let value = src[0] as Op;
        src = src.slice(1);

        return { type: "Op", value };
      }

      let acc = "";

      while (is_symbol(src[0]) && !is_whitespace(src[0])) {
        acc += src[0];
        src = src.slice(1);
      }

      return { type: "Symbol", value: acc };
    },
  };
}

export function is_whitespace(char: string) {
  return /\s/.test(char);
}

export function is_symbol(char: string) {
  return char ? /[0-9a-zA-Z._!]/i.test(char) : false;
}

export function is_operator(char: string) {
  return char in OPS_BINARY || char in OPS_UNARY;
}
