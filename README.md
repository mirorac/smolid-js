# smolid-js

A temporally-ordered, short, URL-friendly ID scheme implemented in JavaScript and TypeScript.

This is a JavaScript implementation of the [smolid](https://github.com/dotvezz/smolid) library, providing a 64-bit (8-byte) identifier that is:
- **URL-Friendly**: Short and unobtrusive in its default unpadded base32 string encoding
- **Temporally sortable**: With strong index locality
- **Fast and unique**: Good enough for most use cases

## Features

- ✅ **Multi-platform support**: Works in Node.js, browsers, and Deno
- ✅ **TypeScript support**: Full type definitions included
- ✅ **Zero dependencies**: No external runtime dependencies
- ✅ **Small bundle size**: Lightweight implementation
- ✅ **Type embedding**: Optional type identifier can be embedded in IDs

## Installation

```bash
npm install smolid
```

## Usage

### Node.js / TypeScript

```typescript
import { New, NewWithType, FromString } from 'smolid';

// Generate a new ID
const id = New();
console.log(id.toString()); // e.g., "abcd1234efgh"

// Generate an ID with an embedded type
const typedId = NewWithType(42);
console.log(typedId.isTyped()); // true
console.log(typedId.getType()); // 42

// Parse an ID from string
const parsed = FromString("abcd1234efgh");
console.log(parsed.toTime()); // Date object with millisecond precision
console.log(parsed.version()); // 1
```

### Browser (IIFE)

```html
<script src="node_modules/smolid/dist/index.browser.js"></script>
<script>
  const id = Smolid.New();
  console.log(id.toString());
</script>
```

### Deno

```typescript
import { New, NewWithType, FromString } from "npm:smolid";

const id = New();
console.log(id.toString());
```

## API Reference

### Functions

#### `New(): ID`
Creates a new smolid v1 with a timestamp and random data.

#### `Nil(): ID`
Creates a nil (zero) ID.

#### `NewWithType(typ: number): ID`
Creates a new smolid v1 with an embedded type identifier (0-127).

#### `FromString(s: string): ID`
Parses a smolid from a base32 string (case-insensitive).

#### `Must<T>(fn: () => T): T`
Convenience function that throws if an operation fails.

### ID Methods

#### `toString(): string`
Returns the canonical lowercase base32 string representation.

#### `version(): number`
Returns the version of the ID (currently 1).

#### `toBytes(): Uint8Array`
Returns the 8-byte representation.

#### `toTime(): Date`
Returns the timestamp embedded in the ID with millisecond precision.

#### `getType(): number`
Returns the type identifier (throws if not a typed ID).

#### `isTyped(): boolean`
Returns true if the ID contains a type identifier.

#### `isOfType(typ: number): boolean`
Returns true if the ID is typed and matches the given type.

#### `toBigInt(): bigint`
Returns the raw 64-bit integer as a BigInt.

#### `toNumber(): number`
Returns the raw 64-bit integer as a number (may lose precision).

## ID Structure

The ID is a 64-bit value with the following structure:

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          time_high                            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|    time_low     |ver|t| rand  | type or rand|       rand      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

- **Timestamp (41 bits)**: Millisecond-precision timestamp from epoch 2025-01-01
- **Version (2 bits)**: Version identifier (v1 = `01`)
- **Type Flag (1 bit)**: Indicates if type identifier is embedded
- **Random/Type (20 bits)**: Random data or type identifier + random data

## Examples

### Basic ID Generation

```typescript
import { New } from 'smolid';

const id = New();
console.log(id.toString()); // Short, URL-friendly string
console.log(id.toTime());   // When it was created
console.log(id.version());  // 1
```

### Typed IDs

```typescript
import { NewWithType } from 'smolid';

const USER_TYPE = 1;
const POST_TYPE = 2;

const userId = NewWithType(USER_TYPE);
const postId = NewWithType(POST_TYPE);

if (userId.isOfType(USER_TYPE)) {
  console.log('This is a user ID');
}
```

### Parsing and Validation

```typescript
import { FromString } from 'smolid';

try {
  const id = FromString('abcd1234efgh');
  console.log('Valid ID:', id.toTime());
} catch (error) {
  console.error('Invalid ID:', error);
}
```

## License

MIT

