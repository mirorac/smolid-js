import { assertEquals, assertExists, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { New, Nil, NewWithType, FromString, ID, SmolIDError, ErrUntyped, ErrInvalidType } from "../dist/index.js";

Deno.test("New() creates a valid ID", () => {
  const id = New();
  assertExists(id);
  assertEquals(id.version(), 1);
  assertExists(id.toString());
});

Deno.test("ID.toString() returns lowercase base32", () => {
  const id = New();
  const str = id.toString();
  assertEquals(str, str.toLowerCase());
  assertEquals(/^[a-z2-7]+$/.test(str), true);
});

Deno.test("FromString() parses ID correctly", () => {
  const id1 = New();
  const str = id1.toString();
  const id2 = FromString(str);
  assertEquals(id1.toString(), id2.toString());
});

Deno.test("FromString() is case-insensitive", () => {
  const id1 = New();
  const str = id1.toString();
  const id2 = FromString(str.toUpperCase());
  assertEquals(id1.toString(), id2.toString());
});

Deno.test("Nil() creates zero ID", () => {
  const id = Nil();
  assertEquals(id.toBigInt(), 0n);
});

Deno.test("NewWithType() embeds type correctly", () => {
  const typ = 42;
  const id = NewWithType(typ);
  assertEquals(id.isTyped(), true);
  assertEquals(id.getType(), typ);
  assertEquals(id.isOfType(typ), true);
});

Deno.test("NewWithType() throws on invalid type", () => {
  assertThrows(() => {
    NewWithType(200);
  }, SmolIDError);
});

Deno.test("ID without type throws on getType()", () => {
  const id = New();
  assertThrows(() => {
    id.getType();
  }, Error);
});

Deno.test("ID.toTime() returns valid Date", () => {
  const id = New();
  const date = id.toTime();
  assertExists(date);
  assertEquals(isNaN(date.getTime()), false);
  // Should be close to current time (within 1 second)
  const now = new Date();
  assertEquals(Math.abs(now.getTime() - date.getTime()) < 1000, true);
});

Deno.test("ID.toBytes() returns 8 bytes", () => {
  const id = New();
  const bytes = id.toBytes();
  assertExists(bytes);
  assertEquals(bytes.length, 8);
});

Deno.test("Multiple IDs are unique", () => {
  const id1 = New();
  const id2 = New();
  const id3 = New();
  assertEquals(id1.toString() !== id2.toString(), true);
  assertEquals(id2.toString() !== id3.toString(), true);
  assertEquals(id1.toString() !== id3.toString(), true);
});

Deno.test("IDs are temporally sortable", async () => {
  const ids = [];
  for (let i = 0; i < 5; i++) {
    ids.push(New());
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 2));
  }
  
  // Check that IDs are in ascending order
  for (let i = 1; i < ids.length; i++) {
    assertEquals(ids[i].toBigInt() >= ids[i-1].toBigInt(), true);
  }
});
