import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.167.0/testing/asserts.ts";
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

Deno.test("[unit] should create a AST representing a list of numbers", () => {
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

Deno.test("[unit] should create a AST representing a string", () => {
  let l = create_lexer_stub([
    { type: "String", value: "hello world" },
  ]);

  let sut = create_node(l);

  assertEquals(sut, {
    type: "StringLiteral",
    value: "hello world",
  });
});

Deno.test("[unit] should create a AST representing a unary expression", () => {
  let l = create_lexer_stub([
    { type: "Op", value: "-" },
    { type: "Symbol", value: "2" },
  ]);

  let sut = create_node(l);

  assertEquals(sut, {
    type: "UnaryOp",
    value: {
      op: "-",
      operand: {
        type: "NumberLiteral",
        value: 2,
      },
    },
  });
});

Deno.test("[unit] should throw when provided a incomplete binary expression", () => {
  let l = create_lexer_stub([
    { type: "Symbol", value: "1" },
    { type: "Op", value: "+" },
  ]);

  assertThrows(
    () => create_node(l),
    Error,
    "Expected primary expression but reached the end of the input",
  );
});

Deno.test("[unit] should throw when primary expression starts with )", () => {
  let l = create_lexer_stub([
    { type: "Symbol", value: "1" },
    { type: "Op", value: "+" },
    { type: "ParenEnd", value: ")" },
  ]);

  assertThrows(
    () => create_node(l),
    Error,
    "No primary expression starts with )",
  );
});

Deno.test("[unit] should throw when unexpected end of function call", () => {
  let l = create_lexer_stub([
    { type: "Symbol", value: "max" },
    { type: "ParenStart", value: "(" },
  ]);

  assertThrows(
    () => create_node(l),
    TypeError,
    "Unexpected end of input",
  );
});
