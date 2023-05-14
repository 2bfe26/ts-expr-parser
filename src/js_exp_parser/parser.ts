import { create_lexer } from "./create_lexer.ts";
import { create_ast_node } from "./create_ast_node.ts";
import { eval_ast } from "./eval_ast.ts";

export type ParserContext = {
  // deno-lint-ignore no-explicit-any
  vars?: Record<string, any>;
  // deno-lint-ignore no-explicit-any
  fns?: Record<string, (...n: any[]) => any>;
};

export function parser(src: string, context?: ParserContext) {
  let l = create_lexer(src);
  let ast = create_ast_node(l);

  let token = l.next();
  if (token !== null) {
    throw new TypeError(`Unexpected token '${token}'`);
  }

  return eval_ast(ast, context);
}
