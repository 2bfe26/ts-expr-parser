import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { eval_ast } from "./eval_ast.ts";

Deno.test("[eval_ast] should evaluate symbol nodes correctly", () => {
  assertEquals(
    eval_ast({ type: "Symbol", value: "x" }, { vars: { x: 2 } }),
    2,
  );
});

Deno.test("[eval_ast] should throw error on undefined variables", () => {
  assertThrows(
    () => eval_ast({ type: "Symbol", value: "x" }),
    Error,
    "Unknown variable x",
  );

  assertThrows(
    () => eval_ast({ type: "Symbol", value: "Math.PI" }),
    Error,
    "Unknown variable Math.PI",
  );
});

Deno.test("[eval_ast] should evaluate number nodes correctly", () => {
  assertEquals(
    eval_ast({ type: "Symbol", value: "22" }),
    22,
  );

  assertEquals(
    eval_ast({ type: "Symbol", value: "69" }),
    69,
  );
});

Deno.test("[eval_ast] should evaluate binary operations correctly", () => {
  assertEquals(
    eval_ast({
      type: "BinaryOp",
      value: {
        op: "+",
        lhs: { type: "Symbol", value: "2" },
        rhs: { type: "Symbol", value: "3" },
      },
    }),
    5,
  );

  assertEquals(
    eval_ast({
      type: "BinaryOp",
      value: {
        op: "-",
        lhs: { type: "Symbol", value: "3" },
        rhs: { type: "Symbol", value: "3" },
      },
    }),
    0,
  );

  assertEquals(
    eval_ast({
      type: "BinaryOp",
      value: {
        op: "/",
        lhs: { type: "Symbol", value: "4" },
        rhs: { type: "Symbol", value: "2" },
      },
    }),
    2,
  );

  assertEquals(
    eval_ast({
      type: "BinaryOp",
      value: {
        op: "*",
        lhs: { type: "Symbol", value: "2" },
        rhs: { type: "Symbol", value: "5" },
      },
    }),
    10,
  );
});

Deno.test("[eval_ast] should throw error on unknown binary operator", () => {
  assertThrows(
    () =>
      eval_ast({
        type: "BinaryOp",
        value: {
          // deno-lint-ignore no-explicit-any
          op: "?" as any,
          lhs: { type: "Symbol", value: "2" },
          rhs: { type: "Symbol", value: "5" },
        },
      }),
    Error,
    "Unknown BinaryOp operator ?",
  );
});

Deno.test("[eval_ast] should evaluate unary operations correctly", () => {
  assertEquals(
    eval_ast({
      type: "UnaryOp",
      value: {
        op: "-",
        operand: { type: "Symbol", value: "1" },
      },
    }),
    -1,
  );
});

Deno.test("[eval_ast] should throw error on unknown unary operator", () => {
  assertThrows(
    () =>
      eval_ast({
        type: "UnaryOp",
        value: {
          // deno-lint-ignore no-explicit-any
          op: "?" as any,
          operand: { type: "Symbol", value: "1" },
        },
      }),
    Error,
    "Unknown UnaryOp operator ?",
  );
});

Deno.test("[eval_ast] should evaluate function calls correctly", () => {
  assertEquals(
    eval_ast({
      type: "FunctionCall",
      value: {
        name: "max",
        args: [
          { type: "Symbol", value: "2" },
          { type: "Symbol", value: "3" },
        ],
      },
    }, { fns: { "max": Math.max } }),
    3,
  );
});

Deno.test("[eval_ast] should throw error on unknown function", () => {
  assertThrows(
    () =>
      eval_ast({
        type: "FunctionCall",
        value: {
          name: "max",
          args: [
            { type: "Symbol", value: "2" },
            { type: "Symbol", value: "3" },
          ],
        },
      }),
    Error,
    "Unknown function max",
  );
});
