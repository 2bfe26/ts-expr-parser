import { Lexer } from "./create_lexer.ts";
import { OP_BINARY, OP_UNARY, OPS_BINARY, OPS_UNARY } from "./eval_ast.ts";

export type ASTNode =
  | { type: "BinaryOp"; payload: { op: OP_BINARY; lhs: ASTNode; rhs: ASTNode } }
  | { type: "UnaryOp"; payload: { op: OP_UNARY; operand: ASTNode } }
  | { type: "FunctionCall"; payload: { name: string; args: ASTNode[] } }
  | { type: "Symbol"; payload: { value: string } };

export function create_ast_node(l: Lexer, prec = 0): ASTNode {
  let is_primary = prec >= Object.keys(OPS_BINARY).length;

  if (is_primary) {
    let token = l.next();

    if (!token) {
      throw new TypeError(
        "Expected primary expression but reached the end of the input",
      );
    }

    if (token in OPS_UNARY) {
      return {
        type: "UnaryOp",
        payload: { op: token as OP_UNARY, operand: create_ast_node(l) },
      };
    }

    if (token === "(") {
      let exp = create_ast_node(l);
      token = l.next();

      if (token !== ")") {
        throw new TypeError(`Expected ')' but got '${token}'`);
      }

      return exp;
    }

    if (token === ")") {
      throw new TypeError("No primary expression starts with ')'");
    }

    let token_next = l.next();

    if (token_next === "(") {
      let args = [] as ASTNode[];

      token_next = l.next();

      if (token_next === ")") {
        return { type: "FunctionCall", payload: { name: token, args: args } };
      }

      if (token_next === null) {
        throw new TypeError("Unexpected end of input");
      }

      l.unnext();
      args.push(create_ast_node(l));
      token_next = l.next();

      while (token_next == ",") {
        args.push(create_ast_node(l));
        token_next = l.next();
      }

      if (token_next !== ")") {
        throw new TypeError(`Expected ')' but got '${token_next}'`);
      }

      return { type: "FunctionCall", payload: { name: token, args: args } };
    } else {
      if (token_next !== null) {
        l.unnext();
      }

      return { type: "Symbol", payload: { value: token } };
    }
  }

  let lhs = create_ast_node(l, prec + 1);

  let op = l.next() as OP_BINARY;

  if (op) {
    if (op in OPS_BINARY && OPS_BINARY[op].prec === prec) {
      let rhs = create_ast_node(l, prec);

      return { type: "BinaryOp", payload: { op, lhs, rhs } };
    }

    l.unnext();
  }

  return lhs;
}
