import { ASTNode } from "./create_node.ts";

export type Context = {
  vars?: Record<string, any>;
  fns?: Record<string, (...n: any[]) => any>;
};

export function eval_ast(n: ASTNode, context = {} as Context): any {
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
      let should_bind = n.value.name.endsWith("!");

      let name = should_bind
        ? n.value.name.slice(0, n.value.name.length - 1)
        : n.value.name;

      if (!context?.fns?.[name]) {
        throw new Error(`Unknown function ${name}`);
      }

      return should_bind
        ? context.fns[name].bind(
          context.fns,
          ...n.value.params.map((p) => eval_ast(p, context)),
        )
        : context.fns[name].call(
          context.fns,
          ...n.value.params.map((p) => eval_ast(p, context)),
        );
    }

    default: {
      throw new Error(`Unknown ASTNode type ${(n as any).type}`);
    }
  }
}

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
  "**": {
    fn: (lhs: number, rhs: number) => lhs ** rhs,
    prec: 1,
  },
};

export let OPS_UNARY = {
  "-": {
    fn: (lhs: number) => -lhs,
  },
};

export type OpBinary = keyof typeof OPS_BINARY;

export type OpUnary = keyof typeof OPS_UNARY;

export type Op = OpBinary | OpUnary;
