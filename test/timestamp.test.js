import { test } from 'node:test';
import assert from 'node:assert';
import { New, NewWithType } from '../dist/index.js';

test('New() with custom timestamp', () => {
  const customTimestamp = 1735707600000; // 2025-01-01 00:00:00 (EPOCH)
  const id = New(customTimestamp);
  
  assert.ok(id);
  const extractedTime = id.toTime();
  assert.strictEqual(extractedTime.getTime(), customTimestamp);
});

test('New() without timestamp uses current time', () => {
  const before = Date.now();
  const id = New();
  const after = Date.now();
  
  const extractedTime = id.toTime().getTime();
  assert.ok(extractedTime >= before);
  assert.ok(extractedTime <= after);
});

test('NewWithType() with custom timestamp', () => {
  const customTimestamp = 1735707600000 + 86400000; // 2025-01-02 00:00:00
  const typ = 5;
  const id = NewWithType(typ, customTimestamp);
  
  assert.ok(id.isTyped());
  assert.strictEqual(id.getType(), typ);
  const extractedTime = id.toTime();
  assert.strictEqual(extractedTime.getTime(), customTimestamp);
});

test('NewWithType() without timestamp uses current time', () => {
  const typ = 10;
  const before = Date.now();
  const id = NewWithType(typ);
  const after = Date.now();
  
  assert.ok(id.isTyped());
  assert.strictEqual(id.getType(), typ);
  const extractedTime = id.toTime().getTime();
  assert.ok(extractedTime >= before);
  assert.ok(extractedTime <= after);
});

test('Multiple IDs with same custom timestamp differ only in random bits', () => {
  const customTimestamp = 1735707600000 + 3600000; // 2025-01-01 01:00:00
  const id1 = New(customTimestamp);
  const id2 = New(customTimestamp);
  
  // Both should have the same timestamp
  assert.strictEqual(id1.toTime().getTime(), customTimestamp);
  assert.strictEqual(id2.toTime().getTime(), customTimestamp);
  
  // But should be different due to random bits
  assert.notStrictEqual(id1.toString(), id2.toString());
});

test('IDs with different timestamps are ordered correctly', () => {
  const timestamp1 = 1735707600000;
  const timestamp2 = timestamp1 + 1000; // 1 second later
  const timestamp3 = timestamp2 + 1000; // 2 seconds later
  
  const id1 = New(timestamp1);
  const id2 = New(timestamp2);
  const id3 = New(timestamp3);
  
  assert.ok(id1.toBigInt() < id2.toBigInt());
  assert.ok(id2.toBigInt() < id3.toBigInt());
});
