import { ASTNode } from "./create_node.ts";
import { Context } from "./parser.ts";

export function eval_ast(ast_node: ASTNode, context = {} as Context): any {
  switch (ast_node.type) {
    case "Symbol":
      if (isNaN(Number(ast_node.payload.value))) {
        if (!context?.vars?.[ast_node.payload.value]) {
          throw new Error(`Unknown variable ${ast_node.payload.value}`);
        }

        return context.vars[ast_node.payload.value];
      }

      return Number(ast_node.payload.value);

    case "UnaryOp":
      if (!(ast_node.payload.op in OPS_UNARY)) {
        throw new Error(`Unknown UnaryOp operator ${ast_node.payload.op}`);
      }

      return OPS_UNARY[ast_node.payload.op].fn(
        eval_ast(ast_node.payload.operand, context),
      );

    case "BinaryOp":
      if (!(ast_node.payload.op in OPS_BINARY)) {
        throw new Error(`Unknown BinaryOp operator ${ast_node.payload.op}`);
      }

      return OPS_BINARY[ast_node.payload.op].fn(
        eval_ast(ast_node.payload.lhs, context),
        eval_ast(ast_node.payload.rhs, context),
      );

    case "FunctionCall":
      if (!context?.fns?.[ast_node.payload.name]) {
        throw new Error(`Unknown function ${ast_node.payload.name}`);
      }

      return context.fns[ast_node.payload.name].apply(
        context.fns,
        ast_node.payload.args.map((a) => eval_ast(a, context)),
      );

    default:
      throw new Error(`Unknown ASTNode type ${(ast_node as any).type}`);
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
