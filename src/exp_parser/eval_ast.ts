import { ASTNode } from "./create_node.ts";
import { ParserContext } from "./parser.ts";

export function eval_ast(n: ASTNode, context = {} as ParserContext): any {
  switch (n.type) {
    case "NumberLiteral":
    case "StringLiteral": {
      return n.value;
    }

    case "List": {
      return n.value.map((v) => eval_ast(v, context));
    }

    case "Variable": {
      if (typeof context?.vars?.[n.value] === "undefined") {
        throw new Error(`Unknown variable ${n.value}`);
      }

      return context.vars[n.value];
    }

    case "UnaryOp": {
      if (!(n.value.op in OPS_UNARY)) {
        throw new Error(`Unknown UnaryOp operator ${n.value.op}`);
      }

      return OPS_UNARY[n.value.op].fn(
        eval_ast(n.value.operand, context),
      );
    }

    case "BinaryOp": {
      if (!(n.value.op in OPS_BINARY)) {
        throw new Error(`Unknown BinaryOp operator ${n.value.op}`);
      }

      return OPS_BINARY[n.value.op].fn(
        eval_ast(n.value.lhs, context),
        eval_ast(n.value.rhs, context),
      );
    }

    case "FunctionCall": {
      if (!context?.fns?.[n.value.name]) {
        throw new Error(`Unknown function ${n.value.name}`);
      }

      return context.fns[n.value.name].apply(
        context.fns,
        n.value.params.map((p) => eval_ast(p, context)),
      );
    }

    default: {
      throw new Error(`Unknown ASTNode type ${(n as any).type}`);
    }
  }
}

export type OP_BINARY = keyof typeof OPS_BINARY;
export type OP_UNARY = keyof typeof OPS_UNARY;
export type OP = OP_BINARY | OP_UNARY;

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
