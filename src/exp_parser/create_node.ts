import { Lexer } from "./create_lexer.ts";
import { OP_BINARY, OP_UNARY, OPS_BINARY, OPS_UNARY } from "./eval_ast.ts";

export type ASTNode =
  | { type: "BinaryOp"; value: { op: OP_BINARY; lhs: ASTNode; rhs: ASTNode } }
  | { type: "UnaryOp"; value: { op: OP_UNARY; operand: ASTNode } }
  | { type: "FunctionCall"; value: { name: string; params: ASTNode[] } }
  | { type: "List"; value: ASTNode[] }
  | { type: "Variable"; value: string }
  | { type: "NumberLiteral"; value: number }
  | { type: "StringLiteral"; value: string };

export function create_node(l: Lexer, prec = 0): ASTNode {
  let is_primary_expression = prec >= 2;

  if (is_primary_expression) {
    let token = l.next();

    if (!token) {
      throw new TypeError(
        "Expected primary expression but reached the end of the input",
      );
    }

    if (token.type === "ParenEnd") {
      throw new TypeError(
        "No primary expression starts with )",
      );
    }

    if (token.value in OPS_UNARY) {
      return {
        type: "UnaryOp",
        value: { op: token.value as OP_UNARY, operand: create_node(l) },
      };
    }

    if (token.type === "String") {
      return { type: "StringLiteral", value: token.value };
    }

    /**
     * NOTE:
     *  This line and beyond contains expressions that **needs**
     *  performing a lookahead, this is the reason for "token_next".
     */
    let token_next = l.next();

    if (token.type === "ParenStart") {
      console.log("OIi");
      let node = create_node(l);

      if (token_next?.type !== "ParenEnd") {
        throw new TypeError(`Expected ')' but got '${token_next?.value ?? "null"}'`);
      }

      return node;
    }

    if (token.type === "BracketStart") {
      let value = [] as ASTNode[];

      if (!token_next) {
        throw new TypeError("Unexpected end of input");
      }

      if (token_next.type === "BracketEnd") {
        return { type: "List", value };
      }

      l.unnext(token_next);

      value.push(create_node(l));

      token_next = l.next();

      while (token_next?.type === "Comma") {
        value.push(create_node(l));
        token_next = l.next();
      }

      if (token_next?.type !== "BracketEnd") {
        throw new TypeError(`Expected ']' but got '${token_next?.value}'`);
      }

      return { type: "List", value };
    }

    if (token_next?.type === "ParenStart") {
      let params = [] as ASTNode[];

      token_next = l.next();

      if (!token_next) {
        throw new TypeError("Unexpected end of input");
      }

      if (token_next.type === "ParenEnd") {
        return { type: "FunctionCall", value: { name: token.value, params } };
      }

      l.unnext(token_next);

      params.push(create_node(l));
      token_next = l.next();

      while (token_next?.type === "Comma") {
        params.push(create_node(l));
        token_next = l.next();
      }

      if (token_next?.type !== "ParenEnd") {
        throw new TypeError(`Expected ']' but got '${token_next?.value}'`);
      }

      return { type: "FunctionCall", value: { name: token.value, params } };
    }

    if (token.type === "Symbol") {
      if (token_next !== null) {
        l.unnext(token_next);
      }

      let value = Number(token.value);

      if (isNaN(value)) {
        return { type: "Variable", value: token.value };
      }

      return { type: "NumberLiteral", value };
    }
  }

  let lhs = create_node(l, prec + 1);
  let op = l.next();

  while (
    op?.type === "Op" && op.value in OPS_BINARY &&
    OPS_BINARY[op.value].prec === prec
  ) {
    lhs = {
      type: "BinaryOp",
      value: { op: op.value, lhs, rhs: create_node(l, prec + 1) },
    };
    op = l.next();
  }

  if (op) {
    l.unnext(op);
  }

  return lhs;
}
