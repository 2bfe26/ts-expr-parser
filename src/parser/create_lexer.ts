import { OPS_BINARY, OPS_UNARY } from "./eval_ast.ts";

export type Lexer = ReturnType<typeof create_lexer>;

export function create_lexer(src: string) {
  let cursor = 0;

  return {
    unnext: () => cursor--,
    next: () => {
      while (is_whitespace(src[cursor])) cursor++;

      if (!src[cursor]) return null;

      if (is_break_token(src[cursor])) return src[cursor++];

      for (let i = cursor; i < src.length; i++) {
        if (is_break_token(src[i]) || is_whitespace(src[i])) {
          let token = src.slice(cursor, i);
          cursor = i;

          return token;
        }
      }

      let token = src.slice(cursor, src.length);
      cursor = src.length;

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
