import { test } from 'node:test';
import assert from 'node:assert';
import { New, Nil, NewWithType, FromString, ID, SmolIDError, ErrUntyped, ErrInvalidType } from '../dist/index.js';

test('New() creates a valid ID', () => {
  const id = New();
  assert.ok(id instanceof ID);
  assert.ok(id.version() === 1);
  assert.ok(id.toString().length > 0);
});

test('ID.toString() returns lowercase base32', () => {
  const id = New();
  const str = id.toString();
  assert.ok(str === str.toLowerCase());
  assert.ok(/^[a-z2-7]+$/.test(str));
});

test('FromString() parses ID correctly', () => {
  const id1 = New();
  const str = id1.toString();
  const id2 = FromString(str);
  assert.strictEqual(id1.toString(), id2.toString());
});

test('FromString() is case-insensitive', () => {
  const id1 = New();
  const str = id1.toString();
  const id2 = FromString(str.toUpperCase());
  assert.strictEqual(id1.toString(), id2.toString());
});

test('Nil() creates zero ID', () => {
  const id = Nil();
  assert.strictEqual(id.toBigInt(), 0n);
});

test('NewWithType() embeds type correctly', () => {
  const typ = 42;
  const id = NewWithType(typ);
  assert.ok(id.isTyped());
  assert.strictEqual(id.getType(), typ);
  assert.ok(id.isOfType(typ));
});

test('NewWithType() throws on invalid type', () => {
  assert.throws(() => {
    NewWithType(200);
  }, SmolIDError);
});

test('ID without type throws on getType()', () => {
  const id = New();
  assert.throws(() => {
    id.getType();
  }, ErrUntyped);
});

test('ID.toTime() returns valid Date', () => {
  const id = New();
  const date = id.toTime();
  assert.ok(date instanceof Date);
  assert.ok(!isNaN(date.getTime()));
  // Should be close to current time (within 1 second)
  const now = new Date();
  assert.ok(Math.abs(now.getTime() - date.getTime()) < 1000);
});

test('ID.toBytes() returns 8 bytes', () => {
  const id = New();
  const bytes = id.toBytes();
  assert.ok(bytes instanceof Uint8Array);
  assert.strictEqual(bytes.length, 8);
});

test('Multiple IDs are unique', () => {
  const id1 = New();
  const id2 = New();
  const id3 = New();
  assert.notStrictEqual(id1.toString(), id2.toString());
  assert.notStrictEqual(id2.toString(), id3.toString());
  assert.notStrictEqual(id1.toString(), id3.toString());
});

test('IDs are temporally sortable', async () => {
  const ids = [];
  for (let i = 0; i < 5; i++) {
    ids.push(New());
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 2));
  }
  
  // Check that IDs are in ascending order
  for (let i = 1; i < ids.length; i++) {
    assert.ok(ids[i].toBigInt() >= ids[i-1].toBigInt());
  }
});
