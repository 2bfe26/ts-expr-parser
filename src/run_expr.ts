import { create_lexer } from "./create_lexer.ts";
import { create_node } from "./create_node.ts";
import { Context, eval_ast } from "./eval_ast.ts";

export function run_expr(src: string, context?: Context) {
  let l = create_lexer(src);
  let ast = create_node(l);

  let token = l.next();
  if (token !== null) {
    throw new TypeError(`Unexpected token ${token.value}`);
  }

  return eval_ast(ast, context);
}
