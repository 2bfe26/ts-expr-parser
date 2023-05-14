import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { parser } from "./parser.ts";

Deno.test("should properly evaluate math expressions", () => {
  assertEquals(parser("2 + 2 + 2"), 6);
  assertEquals(parser("3 - 3 - 10"), -10);
  assertEquals(parser("1 * 5 * 10 * 2"), 100);
  assertEquals(parser("10 / 2"), 5);
});

Deno.test("should properly evaluate math expressions with variables", () => {
  assertEquals(parser("2 + 2 + 2 * x", { vars: { x: 10 } }), 24);
  assertEquals(parser("3 - 3 - 10 * x", { vars: { x: 10 } }), -100);
  assertEquals(parser("1 * 5 * 10 * 2 * x", { vars: { x: 10 } }), 1000);
  assertEquals(parser("10 / 2 * x", { vars: { x: 10 } }), 50);
});

Deno.test("should properly evaluate math expressions with functions", () => {
  assertEquals(
    parser("2 + 2 + 2 * get_ten()", { fns: { get_ten: () => 10 } }),
    24,
  );
  assertEquals(
    parser("3 - 3 - 10 * get_ten()", { fns: { get_ten: () => 10 } }),
    -100,
  );
  assertEquals(
    parser("1 * 5 * 10 * 2 * get_ten()", { fns: { get_ten: () => 10 } }),
    1000,
  );
  assertEquals(
    parser("10 / 2 * get_ten()", { fns: { get_ten: () => 10 } }),
    50,
  );
});
