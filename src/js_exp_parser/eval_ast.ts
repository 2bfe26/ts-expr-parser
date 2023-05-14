import { ASTNode } from "./create_ast_node.ts";
import { ParserContext } from "./parser.ts";

// deno-lint-ignore no-explicit-any
export function eval_ast(node: ASTNode, context = {} as ParserContext): any {
  switch (node.type) {
    case "Symbol":
      if (isNaN(Number(node.payload.value))) {
        if (!context?.vars?.[node.payload.value]) {
          throw new Error(`Unknown variable ${node.payload.value}`);
        }

        return context.vars[node.payload.value];
      }

      return Number(node.payload.value);

    case "UnaryOp":
      if (!(node.payload.op in OPS_UNARY)) {
        throw new Error(`Unknown UnaryOp operator ${node.payload.op}`);
      }

      return OPS_UNARY[node.payload.op].fn(
        eval_ast(node.payload.operand, context),
      );

    case "BinaryOp":
      if (!(node.payload.op in OPS_BINARY)) {
        throw new Error(`Unknown BinaryOp operator ${node.payload.op}`);
      }

      return OPS_BINARY[node.payload.op].fn(
        eval_ast(node.payload.lhs, context),
        eval_ast(node.payload.rhs, context),
      );

    case "FunctionCall":
      if (!context?.fns?.[node.payload.name]) {
        throw new Error(`Unknown function ${node.payload.name}`);
      }

      return context.fns[node.payload.name].apply(
        context.fns,
        node.payload.args.map((a) => eval_ast(a, context)),
      );

    default:
      // deno-lint-ignore no-explicit-any
      throw new Error(`Unknown ASTNode type ${(node as any).type}`);
  }
}

export type OP_BINARY = keyof typeof OPS_BINARY;
export type OP_UNARY = keyof typeof OPS_UNARY;

export let OPS_BINARY = {
  "+": {
    fn: (lhs: number, rhs: number) => lhs + rhs,
    prec: 0,
  },
  "-": {
    fn: (lhs: number, rhs: number) => lhs - rhs,
    prec: 0,
  },
  "*": {
    fn: (lhs: number, rhs: number) => lhs * rhs,
    prec: 1,
  },
  "/": {
    fn: (lhs: number, rhs: number) => lhs / rhs,
    prec: 1,
  },
  "%": {
    fn: (lhs: number, rhs: number) => lhs % rhs,
    prec: 1,
  },
};

export let OPS_UNARY = {
  "-": {
    fn: (lhs: number) => -lhs,
  },
};
