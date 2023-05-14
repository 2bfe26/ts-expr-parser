import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { eval_ast } from "./eval_ast.ts";

Deno.test("should evaluate symbol nodes correctly", () => {
  assertEquals(
    eval_ast({ type: "Symbol", payload: { value: "x" } }, { vars: { x: 2 } }),
    2,
  );
});

Deno.test("should throw error on undefined variables", () => {
  assertThrows(
    () => eval_ast({ type: "Symbol", payload: { value: "x" } }),
    Error,
    "Unknown variable x",
  );

  assertThrows(
    () => eval_ast({ type: "Symbol", payload: { value: "Math.PI" } }),
    Error,
    "Unknown variable Math.PI",
  );
});

Deno.test("should evaluate number nodes correctly", () => {
  assertEquals(
    eval_ast({ type: "Symbol", payload: { value: "22" } }),
    22,
  );

  assertEquals(
    eval_ast({ type: "Symbol", payload: { value: "69" } }),
    69,
  );
});

Deno.test("should evaluate binary operations correctly", () => {
  assertEquals(
    eval_ast({
      type: "BinaryOp",
      payload: {
        op: "+",
        lhs: { type: "Symbol", payload: { value: "2" } },
        rhs: { type: "Symbol", payload: { value: "3" } },
      },
    }),
    5,
  );

  assertEquals(
    eval_ast({
      type: "BinaryOp",
      payload: {
        op: "-",
        lhs: { type: "Symbol", payload: { value: "3" } },
        rhs: { type: "Symbol", payload: { value: "3" } },
      },
    }),
    0,
  );

  assertEquals(
    eval_ast({
      type: "BinaryOp",
      payload: {
        op: "/",
        lhs: { type: "Symbol", payload: { value: "4" } },
        rhs: { type: "Symbol", payload: { value: "2" } },
      },
    }),
    2,
  );

  assertEquals(
    eval_ast({
      type: "BinaryOp",
      payload: {
        op: "*",
        lhs: { type: "Symbol", payload: { value: "2" } },
        rhs: { type: "Symbol", payload: { value: "5" } },
      },
    }),
    10,
  );
});

Deno.test("should throw error on unknown binary operator", () => {
  assertThrows(
    () =>
      eval_ast({
        type: "BinaryOp",
        payload: {
          // deno-lint-ignore no-explicit-any
          op: "?" as any,
          lhs: { type: "Symbol", payload: { value: "2" } },
          rhs: { type: "Symbol", payload: { value: "5" } },
        },
      }),
    Error,
    "Unknown BinaryOp operator ?",
  );
});

Deno.test("should evaluate unary operations correctly", () => {
  assertEquals(
    eval_ast({
      type: "UnaryOp",
      payload: {
        op: "-",
        operand: { type: "Symbol", payload: { value: "1" } },
      },
    }),
    -1,
  );
});

Deno.test("should throw error on unknown unary operator", () => {
  assertThrows(
    () =>
      eval_ast({
        type: "UnaryOp",
        payload: {
          // deno-lint-ignore no-explicit-any
          op: "?" as any,
          operand: { type: "Symbol", payload: { value: "1" } },
        },
      }),
    Error,
    "Unknown UnaryOp operator ?",
  );
});

Deno.test("should evaluate function calls correctly", () => {
  assertEquals(
    eval_ast({
      type: "FunctionCall",
      payload: {
        name: "max",
        args: [
          { type: "Symbol", payload: { value: "2" } },
          { type: "Symbol", payload: { value: "3" } },
        ],
      },
    }, { fns: { "max": Math.max } }),
    3,
  );
});

Deno.test("should throw error on unknown function", () => {
  assertThrows(
    () =>
      eval_ast({
        type: "FunctionCall",
        payload: {
          name: "max",
          args: [
            { type: "Symbol", payload: { value: "2" } },
            { type: "Symbol", payload: { value: "3" } },
          ],
        },
      }),
    Error,
    "Unknown function max",
  );
});
