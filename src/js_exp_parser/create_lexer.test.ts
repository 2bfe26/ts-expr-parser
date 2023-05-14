import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { create_lexer } from "./create_lexer.ts";

Deno.test("should properly iterate over the given source", () => {
  let sut = create_lexer("1 + 2 * 3");

  assertEquals(sut.next(), "1");
  assertEquals(sut.next(), "+");
  assertEquals(sut.next(), "2");

  sut.unnext("2");
  sut.unnext("+");
  sut.unnext("1");

  assertEquals(sut.next(), "1");
});

Deno.test("should ignore whitespace", () => {
  let sut = create_lexer("      1      + 2  * 3       ");

  assertEquals(sut.next(), "1");
  assertEquals(sut.next(), "+");
  assertEquals(sut.next(), "2");
});

Deno.test("should handle decimal numbers properly", () => {
  let sut = create_lexer("1.3 + 2.33332 * 1");

  assertEquals(sut.next(), "1.3");
  assertEquals(sut.next(), "+");
  assertEquals(sut.next(), "2.33332");
});

Deno.test("should handle variables properly", () => {
  let sut = create_lexer("2 * PI");

  assertEquals(sut.next(), "2");
  assertEquals(sut.next(), "*");
  assertEquals(sut.next(), "PI");
});

Deno.test("should handle namespaced variables properly", () => {
  let sut = create_lexer("2 * Math.PI");

  assertEquals(sut.next(), "2");
  assertEquals(sut.next(), "*");
  assertEquals(sut.next(), "Math.PI");
});

Deno.test("should handle functions without arguments properly", () => {
  let sut = create_lexer("2 * Math.random()");

  assertEquals(sut.next(), "2");
  assertEquals(sut.next(), "*");
  assertEquals(sut.next(), "Math.random");
  assertEquals(sut.next(), "(");
  assertEquals(sut.next(), ")");
});

Deno.test("should handle functions with arguments properly", () => {
  let sut = create_lexer("2 * Math.ceil(3.2)");

  assertEquals(sut.next(), "2");
  assertEquals(sut.next(), "*");
  assertEquals(sut.next(), "Math.ceil");
  assertEquals(sut.next(), "(");
  assertEquals(sut.next(), "3.2");
  assertEquals(sut.next(), ")");
});

Deno.test("should handle nested functions properly", () => {
  let sut = create_lexer("2 * Math.ceil(Math.random())");

  assertEquals(sut.next(), "2");
  assertEquals(sut.next(), "*");
  assertEquals(sut.next(), "Math.ceil");
  assertEquals(sut.next(), "(");
  assertEquals(sut.next(), "Math.random");
  assertEquals(sut.next(), "(");
  assertEquals(sut.next(), ")");
  assertEquals(sut.next(), ")");
});

Deno.test("unnext should return index of before a word", () => {
  let sut = create_lexer("2 * Math.ceil(Math.random())");

  assertEquals(sut.next(), "2");
  assertEquals(sut.next(), "*");
  assertEquals(sut.next(), "Math.ceil");
  assertEquals(sut.next(), "(");

  sut.unnext("(");
  sut.unnext("Math.ceil");

  assertEquals(sut.next(), "Math.ceil");
});
