/**
 * Comprehensive integration test for smolid-js
 * This test verifies all features work correctly together
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { New, Nil, NewWithType, FromString, ID, SmolIDError, Must } from '../dist/index.js';

test('Integration: Complete workflow', async () => {
  console.log('\n=== Running Comprehensive Integration Test ===\n');

  // 1. Generate IDs
  console.log('1. Generating IDs...');
  const id1 = New();
  const id2 = New();
  assert.ok(id1 instanceof ID);
  assert.ok(id2 instanceof ID);
  assert.notStrictEqual(id1.toString(), id2.toString());
  console.log('   ✓ Generated unique IDs:', id1.toString(), id2.toString());

  // 2. Test temporal ordering
  console.log('2. Testing temporal ordering...');
  await new Promise(resolve => setTimeout(resolve, 5));
  const id3 = New();
  assert.ok(id3.toBigInt() > id1.toBigInt());
  assert.ok(id3.toBigInt() > id2.toBigInt());
  console.log('   ✓ IDs are temporally ordered');

  // 3. Test string parsing
  console.log('3. Testing string parsing...');
  const str = id1.toString();
  const parsed = FromString(str);
  assert.strictEqual(parsed.toString(), str);
  const parsedUpper = FromString(str.toUpperCase());
  assert.strictEqual(parsedUpper.toString(), str);
  console.log('   ✓ String parsing works (case-insensitive)');

  // 4. Test typed IDs
  console.log('4. Testing typed IDs...');
  const USER_TYPE = 1;
  const POST_TYPE = 2;
  const COMMENT_TYPE = 3;
  
  const userId = NewWithType(USER_TYPE);
  const postId = NewWithType(POST_TYPE);
  const commentId = NewWithType(COMMENT_TYPE);
  
  assert.ok(userId.isTyped());
  assert.strictEqual(userId.getType(), USER_TYPE);
  assert.ok(userId.isOfType(USER_TYPE));
  assert.ok(!userId.isOfType(POST_TYPE));
  
  assert.ok(postId.isTyped());
  assert.strictEqual(postId.getType(), POST_TYPE);
  assert.ok(postId.isOfType(POST_TYPE));
  
  assert.ok(commentId.isTyped());
  assert.strictEqual(commentId.getType(), COMMENT_TYPE);
  console.log('   ✓ Typed IDs work correctly');
  console.log('     - User:', userId.toString(), '(type:', userId.getType() + ')');
  console.log('     - Post:', postId.toString(), '(type:', postId.getType() + ')');
  console.log('     - Comment:', commentId.toString(), '(type:', commentId.getType() + ')');

  // 5. Test timestamps
  console.log('5. Testing timestamp extraction...');
  const now = new Date();
  const id = New();
  const time = id.toTime();
  const diff = Math.abs(now.getTime() - time.getTime());
  assert.ok(diff < 1000); // Should be within 1 second
  console.log('   ✓ Timestamp extraction works');
  console.log('     - Current time:', now.toISOString());
  console.log('     - ID time:', time.toISOString());
  console.log('     - Difference:', diff, 'ms');

  // 6. Test version
  console.log('6. Testing version...');
  const ids = [id1, id2, id3, userId, postId];
  for (const id of ids) {
    assert.strictEqual(id.version(), 1);
  }
  console.log('   ✓ All IDs are version 1');

  // 7. Test bytes conversion
  console.log('7. Testing byte conversion...');
  const bytes = id1.toBytes();
  assert.ok(bytes instanceof Uint8Array);
  assert.strictEqual(bytes.length, 8);
  console.log('   ✓ Byte conversion works');
  console.log('     - Bytes:', Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' '));

  // 8. Test nil ID
  console.log('8. Testing nil ID...');
  const nilId = Nil();
  assert.strictEqual(nilId.toBigInt(), 0n);
  assert.ok(nilId.toString().length > 0);
  console.log('   ✓ Nil ID works:', nilId.toString());

  // 9. Test error handling
  console.log('9. Testing error handling...');
  assert.throws(() => NewWithType(200), SmolIDError);
  const untypedId = New();
  assert.throws(() => untypedId.getType(), SmolIDError);
  assert.throws(() => untypedId.isOfType(1), SmolIDError);
  console.log('   ✓ Error handling works');

  // 10. Test Must helper
  console.log('10. Testing Must helper...');
  const mustId = Must(() => NewWithType(5));
  assert.strictEqual(mustId.getType(), 5);
  assert.throws(() => Must(() => NewWithType(200)), SmolIDError);
  console.log('   ✓ Must helper works');

  // 11. Stress test: Generate many IDs quickly
  console.log('11. Stress test: Generating 1000 IDs...');
  const manyIds = [];
  for (let i = 0; i < 1000; i++) {
    manyIds.push(New());
  }
  
  // Check uniqueness
  const uniqueIds = new Set(manyIds.map(id => id.toString()));
  assert.strictEqual(uniqueIds.size, 1000);
  console.log('   ✓ Generated 1000 unique IDs');

  // Check they're mostly in order (some may have same timestamp)
  let ordered = 0;
  for (let i = 1; i < manyIds.length; i++) {
    if (manyIds[i].toBigInt() >= manyIds[i-1].toBigInt()) {
      ordered++;
    }
  }
  const orderPercentage = (ordered / 999) * 100;
  console.log('   ✓', orderPercentage.toFixed(1) + '% in temporal order');

  console.log('\n=== All Integration Tests Passed! ===\n');
});
