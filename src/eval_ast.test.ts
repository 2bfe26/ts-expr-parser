import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { eval_ast } from "./eval_ast.ts";

Deno.test("[unit] should evaluate symbol nodes correctly", () => {
  assertEquals(
    eval_ast({ type: "Variable", value: "x" }, { vars: { x: 2 } }),
    2,
  );
});

Deno.test("[unit] should throw error on undefined variables", () => {
  assertThrows(
    () => eval_ast({ type: "Variable", value: "x" }),
    Error,
    "Unknown variable x",
  );

  assertThrows(
    () => eval_ast({ type: "Variable", value: "Math.PI" }),
    Error,
    "Unknown variable Math.PI",
  );
});

Deno.test("[unit] should evaluate number nodes correctly", () => {
  assertEquals(
    eval_ast({ type: "NumberLiteral", value: 22 }),
    22,
  );

  assertEquals(
    eval_ast({ type: "NumberLiteral", value: 69 }),
    69,
  );
});

Deno.test("[unit] should evaluate binary operations correctly", () => {
  assertEquals(
    eval_ast({
      type: "BinaryOp",
      value: {
        op: "+",
        lhs: { type: "NumberLiteral", value: 2 },
        rhs: { type: "NumberLiteral", value: 3 },
      },
    }),
    5,
  );

  assertEquals(
    eval_ast({
      type: "BinaryOp",
      value: {
        op: "-",
        lhs: { type: "NumberLiteral", value: 3 },
        rhs: { type: "NumberLiteral", value: 3 },
      },
    }),
    0,
  );

  assertEquals(
    eval_ast({
      type: "BinaryOp",
      value: {
        op: "/",
        lhs: { type: "NumberLiteral", value: 4 },
        rhs: { type: "NumberLiteral", value: 2 },
      },
    }),
    2,
  );

  assertEquals(
    eval_ast({
      type: "BinaryOp",
      value: {
        op: "*",
        lhs: { type: "NumberLiteral", value: 2 },
        rhs: { type: "NumberLiteral", value: 5 },
      },
    }),
    10,
  );

  assertEquals(
    eval_ast({
      type: "BinaryOp",
      value: {
        op: "%",
        lhs: { type: "NumberLiteral", value: 10 },
        rhs: { type: "NumberLiteral", value: 3 },
      },
    }),
    1,
  );

  assertEquals(
    eval_ast({
      type: "BinaryOp",
      value: {
        op: "**",
        lhs: { type: "NumberLiteral", value: 2 },
        rhs: { type: "NumberLiteral", value: 3 },
      },
    }),
    8,
  );
});

Deno.test("[unit] should throw error on unknown binary operator", () => {
  assertThrows(
    () =>
      eval_ast({
        type: "BinaryOp",
        value: {
          op: "?" as any,
          lhs: { type: "NumberLiteral", value: 2 },
          rhs: { type: "NumberLiteral", value: 5 },
        },
      }),
    Error,
    "Unknown BinaryOp operator ?",
  );
});

Deno.test("[unit] should evaluate unary operations correctly", () => {
  assertEquals(
    eval_ast({
      type: "UnaryOp",
      value: {
        op: "-",
        operand: { type: "NumberLiteral", value: 1 },
      },
    }),
    -1,
  );
});

Deno.test("[unit] should evaluate lists correctly", () => {
  assertEquals(
    eval_ast({
      type: "List",
      value: [
        { type: "NumberLiteral", value: 2 },
        { type: "NumberLiteral", value: 3 },
      ],
    }),
    [2, 3],
  );
});

Deno.test("[unit] should evaluate empty lists correctly", () => {
  assertEquals(
    eval_ast({ type: "List", value: [] }),
    [],
  );
});

Deno.test("[unit] should throw error on unknown unary operator", () => {
  assertThrows(
    () =>
      eval_ast({
        type: "UnaryOp",
        value: {
          op: "?" as any,
          operand: { type: "NumberLiteral", value: 1 },
        },
      }),
    Error,
    "Unknown UnaryOp operator ?",
  );
});

Deno.test("[unit] should evaluate function calls correctly", () => {
  assertEquals(
    eval_ast({
      type: "FunctionCall",
      value: {
        name: "max",
        params: [
          { type: "NumberLiteral", value: 2 },
          { type: "NumberLiteral", value: 3 },
        ],
      },
    }, { fns: { "max": Math.max } }),
    3,
  );
});

Deno.test("[unit] should evaluate function binds (!) correctly", () => {
  let fn = eval_ast({
    type: "FunctionCall",
    value: {
      name: "max!",
      params: [
        { type: "NumberLiteral", value: 2 },
        { type: "NumberLiteral", value: 3 },
      ],
    },
  }, { fns: { "max": Math.max } });

  assertEquals(typeof fn, "function");
  assertEquals(fn(), 3);
});

Deno.test("[unit] should throw error on unknown function", () => {
  assertThrows(
    () =>
      eval_ast({
        type: "FunctionCall",
        value: {
          name: "max",
          params: [
            { type: "NumberLiteral", value: 2 },
            { type: "NumberLiteral", value: 3 },
          ],
        },
      }),
    Error,
    "Unknown function max",
  );
});

Deno.test("[unit] should throw error when unknown AST node is provided", () => {
  assertThrows(
    () => eval_ast({ type: "Whoa" as any, value: ":O" }),
    Error,
    "Unknown ASTNode type Whoa",
  );
});
