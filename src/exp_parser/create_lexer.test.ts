import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { create_lexer, is_break_token } from "./create_lexer.ts";

Deno.test("[create_lexer] should properly iterate over the given source", () => {
  let sut = create_lexer("1 + 2 * 3");

  assertEquals(sut.next(), "1");
  assertEquals(sut.next(), "+");
  assertEquals(sut.next(), "2");

  sut.unnext("2");
  sut.unnext("+");
  sut.unnext("1");

  assertEquals(sut.next(), "1");
});

Deno.test("[create_lexer] should ignore whitespace", () => {
  let sut = create_lexer("      1      + 2  * 3       ");

  assertEquals(sut.next(), "1");
  assertEquals(sut.next(), "+");
  assertEquals(sut.next(), "2");
});

Deno.test("[create_lexer] should handle decimal numbers properly", () => {
  let sut = create_lexer("1.3 + 2.33332 * 1");

  assertEquals(sut.next(), "1.3");
  assertEquals(sut.next(), "+");
  assertEquals(sut.next(), "2.33332");
});

Deno.test("[create_lexer] should handle variables properly", () => {
  let sut = create_lexer("2 * PI");

  assertEquals(sut.next(), "2");
  assertEquals(sut.next(), "*");
  assertEquals(sut.next(), "PI");
});

Deno.test("[create_lexer] should handle namespaced variables properly", () => {
  let sut = create_lexer("2 * Math.PI");

  assertEquals(sut.next(), "2");
  assertEquals(sut.next(), "*");
  assertEquals(sut.next(), "Math.PI");
});

Deno.test("[create_lexer] should handle functions without arguments properly", () => {
  let sut = create_lexer("2 * Math.random()");

  assertEquals(sut.next(), "2");
  assertEquals(sut.next(), "*");
  assertEquals(sut.next(), "Math.random");
  assertEquals(sut.next(), "(");
  assertEquals(sut.next(), ")");
});

Deno.test("[create_lexer] should handle functions with arguments properly", () => {
  let sut = create_lexer("2 * Math.ceil(3.2)");

  assertEquals(sut.next(), "2");
  assertEquals(sut.next(), "*");
  assertEquals(sut.next(), "Math.ceil");
  assertEquals(sut.next(), "(");
  assertEquals(sut.next(), "3.2");
  assertEquals(sut.next(), ")");
});

Deno.test("[create_lexer] should handle nested functions properly", () => {
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

Deno.test("[create_lexer] unnext should return index of before a word", () => {
  let sut = create_lexer("2 * Math.ceil(Math.random())");

  assertEquals(sut.next(), "2");
  assertEquals(sut.next(), "*");
  assertEquals(sut.next(), "Math.ceil");
  assertEquals(sut.next(), "(");

  sut.unnext("(");
  sut.unnext("Math.ceil");

  assertEquals(sut.next(), "Math.ceil");
});

Deno.test("[create_lexer] should handle strings properly", () => {
  let sut = create_lexer("2 + 'oi'");

  assertEquals(sut.next(), "2");
  assertEquals(sut.next(), "+");
  assertEquals(sut.next(), "'oi'");
});

Deno.test("[is_break_token] should return true if is a break token", () => {
  assertEquals(is_break_token("+"), true);
  assertEquals(is_break_token("-"), true);
  assertEquals(is_break_token("/"), true);
  assertEquals(is_break_token("*"), true);
  assertEquals(is_break_token("%"), true);

  assertEquals(is_break_token(","), true);
  assertEquals(is_break_token("("), true);
  assertEquals(is_break_token(")"), true);
});

Deno.test("[is_break_token] should return false if is not a break token", () => {
  assertEquals(is_break_token("a"), false);
  assertEquals(is_break_token("b"), false);
  assertEquals(is_break_token("c"), false);
  assertEquals(is_break_token("d"), false);
  assertEquals(is_break_token("1"), false);

  assertEquals(is_break_token(" "), false);
  assertEquals(is_break_token("_"), false);
  assertEquals(is_break_token("$"), false);
});
