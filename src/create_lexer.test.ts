import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { create_lexer } from "./create_lexer.ts";

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

Deno.test("[unit] unnext should return index of before a word", () => {
  let sut = create_lexer("2 * Math.ceil(Math.random())");

  assertEquals(sut.next(), { type: "Symbol", value: "2" });
  assertEquals(sut.next(), { type: "Op", value: "*" });
  assertEquals(sut.next(), { type: "Symbol", value: "Math.ceil" });
  assertEquals(sut.next(), { type: "ParenStart", value: "(" });

  sut.unnext({ type: "ParenStart", value: "(" });
  sut.unnext({ type: "Symbol", value: "Math.ceil" });

  assertEquals(sut.next(), { type: "Symbol", value: "Math.ceil" });
});

Deno.test("[unit] should handle strings properly", () => {
  let sut = create_lexer('2 + "oi"');

  assertEquals(sut.next(), { type: "Symbol", value: "2" });
  assertEquals(sut.next(), { type: "Op", value: "+" });
  assertEquals(sut.next(), { type: "String", value: "oi" });
});
