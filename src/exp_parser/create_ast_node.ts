import { Lexer } from "./create_lexer.ts";
import { OP_BINARY, OP_UNARY, OPS_BINARY, OPS_UNARY } from "./eval_ast.ts";

export type ASTNode =
  | { type: "BinaryOp"; value: { op: OP_BINARY; lhs: ASTNode; rhs: ASTNode } }
  | { type: "UnaryOp"; value: { op: OP_UNARY; operand: ASTNode } }
  | { type: "FunctionCall"; value: { name: string; args: ASTNode[] } }
  | { type: "List"; value: ASTNode[] }
  | { type: "Symbol"; value: string }
  | { type: "StringLiteral"; value: string };

export function create_ast_node(l: Lexer, prec = 0): ASTNode {
  // is_primary
  if (prec >= 2) {
    let token = l.next();

    if (!token) {
      throw new TypeError(
        "Expected primary expression but reached the end of the input",
      );
    }

    if (token.startsWith('"')) {
      return { type: "StringLiteral", value: token.slice(1, token.length - 1) };
    }

    if (token === "[") {
      let elements = [] as ASTNode[];

      token = l.next();

      if (token === "]") {
        return { type: "List", value: [] };
      }

      if (token === null) {
        throw new TypeError("Unexpected end of input");
      }

      l.unnext(token);

      elements.push(create_ast_node(l));
      token = l.next();

      while (token == ",") {
        elements.push(create_ast_node(l));
        token = l.next();
      }

      if (token !== "]") {
        throw new TypeError(`Expected ']' but got '${token}'`);
      }

      return { type: "List", value: elements };
    }

    if (token in OPS_UNARY) {
      return {
        type: "UnaryOp",
        value: { op: token as OP_UNARY, operand: create_ast_node(l) },
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
        return { type: "FunctionCall", value: { name: token, args: args } };
      }

      if (token_next === null) {
        throw new TypeError("Unexpected end of input");
      }

      l.unnext(token_next);

      args.push(create_ast_node(l));
      token_next = l.next();

      while (token_next == ",") {
        args.push(create_ast_node(l));
        token_next = l.next();
      }

      if (token_next !== ")") {
        throw new TypeError(`Expected ')' but got '${token_next}'`);
      }

      return { type: "FunctionCall", value: { name: token, args: args } };
    } else {
      if (token_next !== null) {
        l.unnext(token_next);
      }

      return { type: "Symbol", value: token };
    }
  }

  let lhs = create_ast_node(l, prec + 1);

  let op = l.next() as OP_BINARY;

  while (op && op in OPS_BINARY && OPS_BINARY[op].prec === prec) {
    let rhs = create_ast_node(l, prec + 1);
    lhs = { type: "BinaryOp", value: { op, lhs, rhs } };
    op = l.next() as OP_BINARY;
  }

  if (op) {
    l.unnext(op);
  }

  return lhs;
}
