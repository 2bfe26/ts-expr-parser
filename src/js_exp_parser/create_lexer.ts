import { OPS_BINARY, OPS_UNARY } from "./eval_ast.ts";

export type Lexer = ReturnType<typeof create_lexer>;

export function create_lexer(input: string) {
  let src = input;

  return {
    unnext: (token: string) => {
      src = token + src;
    },
    next: () => {
      src = src.trimStart();

      if (!src.length) return null;

      if (is_break_token(src[0])) {
        let token = src[0];
        src = src.slice(1);

        return token;
      }

      for (let i = 0; i < src.length; i++) {
        if (is_break_token(src[i]) || is_whitespace(src[i])) {
          let token = src.slice(0, i);
          src = src.slice(i);

          return token;
        }
      }

      let token = src.slice(0, src.length);
      src = "";

      return token;
    },
  };
}

export function is_whitespace(char: string) {
  return /\s/.test(char);
}

export function is_break_token(char: string) {
  let syntax = ["(", ")", ","];

  return char in OPS_BINARY || char in OPS_UNARY || syntax.includes(char);
}
