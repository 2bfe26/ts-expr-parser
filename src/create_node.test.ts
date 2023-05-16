import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { create_node } from "./create_node.ts";
import { Lexer, Token } from "./create_lexer.ts";

function create_lexer_stub(tokens: Token[]): Lexer {
  let state = [...tokens];

  return {
    unnext: (token: Token) => {
      state.unshift(token);
    },
    next: () => state.shift() ?? null,
  };
}

Deno.test("[unit] should create a AST representing a single number", () => {
  let l = create_lexer_stub([
    { type: "BracketStart", value: "[" },
    { type: "Symbol", value: "1" },
    { type: "Comma", value: "," },
    { type: "Symbol", value: "2" },
    { type: "Comma", value: "," },
    { type: "Symbol", value: "3" },
    { type: "BracketEnd", value: "]" },
  ]);

  let sut = create_node(l);

  assertEquals(sut, {
    type: "List",
    value: [
      { type: "NumberLiteral", value: 1 },
      { type: "NumberLiteral", value: 2 },
      { type: "NumberLiteral", value: 3 },
    ],
  });
});
