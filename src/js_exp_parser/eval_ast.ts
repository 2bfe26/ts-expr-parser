import { ASTNode } from "./create_ast_node.ts";
import { ParserContext } from "./parser.ts";

// deno-lint-ignore no-explicit-any
export function eval_ast(node: ASTNode, context = {} as ParserContext): any {
  switch (node.type) {
    case "Symbol":
      if (isNaN(Number(node.value))) {
        if (!context?.vars?.[node.value]) {
          throw new Error(`Unknown variable ${node.value}`);
        }

        return context.vars[node.value];
      }

      return Number(node.value);

    case "UnaryOp":
      if (!(node.value.op in OPS_UNARY)) {
        throw new Error(`Unknown UnaryOp operator ${node.value.op}`);
      }

      return OPS_UNARY[node.value.op].fn(
        eval_ast(node.value.operand, context),
      );

    case "BinaryOp":
      if (!(node.value.op in OPS_BINARY)) {
        throw new Error(`Unknown BinaryOp operator ${node.value.op}`);
      }

      return OPS_BINARY[node.value.op].fn(
        eval_ast(node.value.lhs, context),
        eval_ast(node.value.rhs, context),
      );

    case "FunctionCall":
      if (!context?.fns?.[node.value.name]) {
        throw new Error(`Unknown function ${node.value.name}`);
      }

      return context.fns[node.value.name].apply(
        context.fns,
        node.value.args.map((a) => eval_ast(a, context)),
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
