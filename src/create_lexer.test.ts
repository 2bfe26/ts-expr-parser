import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { create_lexer, is_operator, is_symbol, is_whitespace } from "./create_lexer.ts";

Deno.test("[unit] should properly iterate over the given source", () => {
  let sut = create_lexer("1 + 2 * 3");

  assertEquals(sut.next(), { type: "Symbol", value: "1" });
  assertEquals(sut.next(), { type: "Op", value: "+" });
  assertEquals(sut.next(), { type: "Symbol", value: "2" });

  sut.unnext({ type: "Symbol", value: "2" });
  sut.unnext({ type: "Op", value: "+" });
  sut.unnext({ type: "Symbol", value: "1" });

  assertEquals(sut.next(), { type: "Symbol", value: "1" });
});

Deno.test("[unit] should ignore whitespace", () => {
  let sut = create_lexer("      1      + 2  * 3       ");

  assertEquals(sut.next(), { type: "Symbol", value: "1" });
  assertEquals(sut.next(), { type: "Op", value: "+" });
  assertEquals(sut.next(), { type: "Symbol", value: "2" });
});

Deno.test("[unit] should handle decimal numbers properly", () => {
  let sut = create_lexer("1.3 + 2.33332 * 1");

  assertEquals(sut.next(), { type: "Symbol", value: "1.3" });
  assertEquals(sut.next(), { type: "Op", value: "+" });
  assertEquals(sut.next(), { type: "Symbol", value: "2.33332" });
});

Deno.test("[unit] should handle variables properly", () => {
  let sut = create_lexer("2 * PI");

  assertEquals(sut.next(), { type: "Symbol", value: "2" });
  assertEquals(sut.next(), { type: "Op", value: "*" });
  assertEquals(sut.next(), { type: "Symbol", value: "PI" });
});

Deno.test("[unit] should handle namespaced variables properly", () => {
  let sut = create_lexer("2 * Math.PI");

  assertEquals(sut.next(), { type: "Symbol", value: "2" });
  assertEquals(sut.next(), { type: "Op", value: "*" });
  assertEquals(sut.next(), { type: "Symbol", value: "Math.PI" });
});

Deno.test("[unit] should handle functions without arguments properly", () => {
  let sut = create_lexer("2 * Math.random()");

  assertEquals(sut.next(), { type: "Symbol", value: "2" });
  assertEquals(sut.next(), { type: "Op", value: "*" });
  assertEquals(sut.next(), { type: "Symbol", value: "Math.random" });
  assertEquals(sut.next(), { type: "ParenStart", value: "(" });
  assertEquals(sut.next(), { type: "ParenEnd", value: ")" });
});

Deno.test("[unit] should handle functions with arguments properly", () => {
  let sut = create_lexer("2 * Math.ceil(3.2)");

  assertEquals(sut.next(), { type: "Symbol", value: "2" });
  assertEquals(sut.next(), { type: "Op", value: "*" });
  assertEquals(sut.next(), { type: "Symbol", value: "Math.ceil" });
  assertEquals(sut.next(), { type: "ParenStart", value: "(" });
  assertEquals(sut.next(), { type: "Symbol", value: "3.2" });
  assertEquals(sut.next(), { type: "ParenEnd", value: ")" });
});

Deno.test("[unit] should handle nested functions properly", () => {
  let sut = create_lexer("2 * Math.ceil(Math.random())");

  assertEquals(sut.next(), { type: "Symbol", value: "2" });
  assertEquals(sut.next(), { type: "Op", value: "*" });
  assertEquals(sut.next(), { type: "Symbol", value: "Math.ceil" });
  assertEquals(sut.next(), { type: "ParenStart", value: "(" });
  assertEquals(sut.next(), { type: "Symbol", value: "Math.random" });
  assertEquals(sut.next(), { type: "ParenStart", value: "(" });
  assertEquals(sut.next(), { type: "ParenEnd", value: ")" });
  assertEquals(sut.next(), { type: "ParenEnd", value: ")" });
});

Deno.test("[unit] unnext should handle strings properly", () => {
  let sut = create_lexer('"hello" + "world"');

  assertEquals(sut.next(), { type: "String", value: "hello" });
  assertEquals(sut.next(), { type: "Op", value: "+" });
  assertEquals(sut.next(), { type: "String", value: "world" });

  sut.unnext({ type: "String", value: "world" });

  assertEquals(sut.next(), { type: "String", value: "world" });
});

Deno.test("[unit] should throw a error when encounter a unclosed string", () => {
  let sut = create_lexer('"hello + 3 ');

  assertThrows(
    () => sut.next(),
    Error,
    "String is not properly closed by double quote",
  );
});

Deno.test("[unit] should handle lists properly", () => {
  let sut = create_lexer("[1, 2]");

  assertEquals(sut.next(), { type: "BracketStart", value: "[" });
  assertEquals(sut.next(), { type: "Symbol", value: "1" });
  assertEquals(sut.next(), { type: "Comma", value: "," });
  assertEquals(sut.next(), { type: "Symbol", value: "2" });
  assertEquals(sut.next(), { type: "BracketEnd", value: "]" });
});

Deno.test("[unit] should return true if input is whitespace", () => {
  assertEquals(is_whitespace(undefined as any), false);
  assertEquals(is_whitespace(" "), true);
  assertEquals(is_whitespace("  "), true);
  assertEquals(is_whitespace("f"), false);
});

Deno.test("[unit] should return true if input is a arithmetic operator", () => {
  assertEquals(is_operator(undefined as any), false);
  assertEquals(is_operator("+"), true);
  assertEquals(is_operator("-"), true);
  assertEquals(is_operator("/"), true);
  assertEquals(is_operator("*"), true);
  assertEquals(is_operator("**"), true);
  assertEquals(is_operator("%"), true);
  assertEquals(is_operator(" "), false);
  assertEquals(is_operator("s"), false);
});

Deno.test("[unit] should return true if input is Symbol", () => {
  assertEquals(is_symbol(undefined as any), false);
  assertEquals(is_symbol("+"), false);
  assertEquals(is_symbol("-"), false);
  assertEquals(is_symbol("a"), true);
  assertEquals(is_symbol("b"), true);
  assertEquals(is_symbol("c"), true);
  assertEquals(is_symbol("1"), true);
  assertEquals(is_symbol("2"), true);
  assertEquals(is_symbol("3"), true);
  assertEquals(is_symbol("."), true);
  assertEquals(is_symbol("!"), true);
  assertEquals(is_symbol("_"), true);
});
