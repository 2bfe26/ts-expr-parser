import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { run_expr } from "./run_expr.ts";

Deno.test("[integration] should properly evaluate math expressions", () => {
  assertEquals(run_expr("2 + 2 + 2"), 6);
  assertEquals(run_expr("3 - 3 - 10"), -10);
  assertEquals(run_expr("1 * 5 * 10 * 2"), 100);
  assertEquals(run_expr("10 / 2"), 5);
});

Deno.test("[integration] should properly evaluate math expressions with variables", () => {
  assertEquals(run_expr("2 + 2 + 2 * x", { vars: { x: 10 } }), 24);
  assertEquals(run_expr("3 - 3 - 10 * x", { vars: { x: 10 } }), -100);
  assertEquals(run_expr("1 * 5 * 10 * 2 * x", { vars: { x: 10 } }), 1000);
  assertEquals(run_expr("10 / 2 * x", { vars: { x: 10 } }), 50);
});

Deno.test("[integration] should properly evaluate math expressions with functions", () => {
  assertEquals(
    run_expr("2 + 2 + 2 * get_ten()", { fns: { get_ten: () => 10 } }),
    24,
  );
  assertEquals(
    run_expr("3 - 3 - 10 * get_ten()", { fns: { get_ten: () => 10 } }),
    -100,
  );
  assertEquals(
    run_expr("1 * 5 * 10 * 2 * get_ten()", { fns: { get_ten: () => 10 } }),
    1000,
  );
  assertEquals(
    run_expr("10 / 2 * get_ten()", { fns: { get_ten: () => 10 } }),
    50,
  );
});

Deno.test("[integration] should properly evaluate math expressions with nested function", () => {
  let context = {
    fns: {
      get_ten: () => 10,
      double_it: (n: number) => n * 2,
    },
  };

  assertEquals(
    run_expr("2 + 2 + 2 * get_ten() + double_it(get_ten())", context),
    44,
  );
  assertEquals(
    run_expr("3 - 3 - 10 * get_ten() + double_it(get_ten())", context),
    -80,
  );
  assertEquals(
    run_expr("1 * 5 * 10 * 2 * get_ten() + double_it(get_ten())", context),
    1020,
  );
  assertEquals(
    run_expr("10 / 2 * get_ten() + double_it(get_ten())", context),
    70,
  );
});

Deno.test("[integration] should throw if after AST creation are remaining tokens in the lexer", () => {
  assertThrows(
    () => run_expr("2 + 2 f"),
    Error,
    "Unexpected token f",
  );
});
