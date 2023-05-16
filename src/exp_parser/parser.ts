import { create_lexer } from "./create_lexer.ts";
import { create_node } from "./create_node.ts";
import { eval_ast } from "./eval_ast.ts";

export type ParserContext = {
  vars?: Record<string, any>;
  fns?: Record<string, (...n: any[]) => any>;
  debug?: boolean;
};

export function parser(src: string, context?: ParserContext) {
  let l = create_lexer(src);
  let ast = create_node(l);

  if (context?.debug) {
    console.log(JSON.stringify(ast, null, 2));
  }

  let token = l.next();
  if (token !== null) {
    throw new TypeError(`Unexpected token '${token.value}'`);
  }

  return eval_ast(ast, context);
}
