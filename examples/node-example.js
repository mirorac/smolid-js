import { New, NewWithType, FromString } from '../dist/index.js';

console.log('=== Smolid Node.js Example ===\n');

// Generate a new ID
const id = New();
console.log('Generated ID:', id.toString());
console.log('ID Version:', id.version());
console.log('ID Time:', id.toTime().toISOString());
console.log('ID BigInt:', id.toBigInt().toString());
console.log('ID Bytes:', Array.from(id.toBytes()).map(b => b.toString(16).padStart(2, '0')).join(' '));
console.log();

// Generate multiple IDs
console.log('Multiple IDs:');
for (let i = 0; i < 5; i++) {
  const id = New();
  console.log(`  ${i + 1}. ${id.toString()}`);
}
console.log();

// Generate typed IDs
const USER_TYPE = 1;
const POST_TYPE = 2;

const userId = NewWithType(USER_TYPE);
const postId = NewWithType(POST_TYPE);

console.log('Typed IDs:');
console.log('  User ID:', userId.toString(), '(type:', userId.getType() + ')');
console.log('  Post ID:', postId.toString(), '(type:', postId.getType() + ')');
console.log('  Is User ID of type USER_TYPE?', userId.isOfType(USER_TYPE));
console.log('  Is Post ID of type USER_TYPE?', postId.isOfType(USER_TYPE));
console.log();

// Parse IDs from strings
const idString = id.toString();
const parsed = FromString(idString);
console.log('Parsed ID:');
console.log('  Original:', idString);
console.log('  Parsed:', parsed.toString());
console.log('  Match:', idString === parsed.toString());
console.log();

// Parse uppercase
const parsedUpper = FromString(idString.toUpperCase());
console.log('Case-insensitive parsing:');
console.log('  Uppercase input:', idString.toUpperCase());
console.log('  Parsed output:', parsedUpper.toString());
console.log('  Match:', idString === parsedUpper.toString());
