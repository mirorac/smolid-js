// Test CommonJS import
const { New, NewWithType, FromString } = require('../dist/index.cjs');

console.log('Testing CommonJS import...');

// Generate a new ID
const id = New();
console.log('✓ New() works:', id.toString());

// Generate typed ID
const typedId = NewWithType(5);
console.log('✓ NewWithType() works:', typedId.toString(), '(type:', typedId.getType() + ')');

// Parse ID
const parsed = FromString(id.toString());
console.log('✓ FromString() works:', parsed.toString());

console.log('\n✓ All CommonJS imports working correctly!');
