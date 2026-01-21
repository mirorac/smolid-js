/**
 * smolid - A temporally-ordered, short, URL-friendly ID scheme
 * 
 * ID is a 64-bit (8-byte) value intended to be:
 * - URL-Friendly; short and unobtrusive in its default unpadded base32 string encoding
 * - temporally sortable with strong index locality
 * - fast-enough and unique-enough for most use cases
 * 
 * Field Definitions:
 * 
 *   0                   1                   2                   3
 *   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *   |                          time_high                            |
 *   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *   |    time_low     |ver|t| rand  | type or rand|       rand      |
 *   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * 
 * Field Descriptions:
 * - Timestamp (41 bits): The most significant 41 bits represent a millisecond-precision timestamp
 *   The allowed timestamp range is 2025-01-01 00:00:00 - 2094-09-07 15:47:35
 * - Version (2 bits): Bits 41-42 are reserved for versioning. v1 is `01`
 * - Type Flag (1 bit): Bit 43 serves as a boolean flag. If set, the "Type/Rand" field is an embedded type identifier.
 * - Random (4 bits): The remaining 4 bits of the 6th byte are populated with pseudo-random data.
 * - Type/Random (7 bits): If the Type Flag is set, this field contains the Type Identifier. Otherwise, it
 *   is populated with pseudo-random data.
 * - Random (9 bits): The remaining byte is dedicated to pseudo-random data to reasonably ensure uniqueness.
 * 
 * String Format:
 * The string format is base32 with no padding. Canonically the string is lowercased. This decision is purely for
 * aesthetics, but the parser is case-insensitive and will accept uppercase base32 strings.
 */

// Constants
const EPOCH = 1735707600000n; // 2025-01-01 00:00:00 in milliseconds
const TIMESTAMP_SIZE = 0b11111111111111111111111111111111111111111n;
const TIMESTAMP_SHIFT_OFFSET = 23n;
const TIMESTAMP_MASK = TIMESTAMP_SIZE << TIMESTAMP_SHIFT_OFFSET;
const VERSION_SHIFT_OFFSET = 21n;
const VERSION_MASK = 0b11n << VERSION_SHIFT_OFFSET;

const V1_TYPE_SHIFT_OFFSET = 9n;
const V1_TYPE_FLAG = 0b1n << 20n;
const V1_TYPE_SIZE = 0b1111111n;
const V1_TYPE_MASK = V1_TYPE_SIZE << V1_TYPE_SHIFT_OFFSET;
const V1_RANDOM_SPACE = 0xfffffn; // In V1, the least significant two and a half bytes (20 bits) can be random
const V1_VERSION = 0b1n << 21n;

// Base32 encoding table (standard, no padding)
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BASE32_DECODE_MAP: { [key: string]: number } = {};
for (let i = 0; i < BASE32_CHARS.length; i++) {
  BASE32_DECODE_MAP[BASE32_CHARS[i]] = i;
  BASE32_DECODE_MAP[BASE32_CHARS[i].toLowerCase()] = i;
}

/**
 * Errors
 */
export class SmolIDError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SmolIDError';
  }
}

export const ErrUntyped = new SmolIDError('no type id is embedded');
export const ErrInvalidType = new SmolIDError(`invalid type id: must be less than or equal to ${V1_TYPE_SIZE}`);

/**
 * Encode a byte array to base32 string (no padding)
 */
function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decode a base32 string (no padding) to byte array
 */
function base32Decode(str: string): Uint8Array {
  str = str.toUpperCase();
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = new Uint8Array(8);

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (!(char in BASE32_DECODE_MAP)) {
      throw new SmolIDError(`invalid character in base32 string: ${char}`);
    }

    value = (value << 5) | BASE32_DECODE_MAP[char];
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }

  return output;
}

/**
 * Get random BigInt up to max (exclusive)
 */
function randomBigInt(max: bigint): bigint {
  // Use crypto.getRandomValues for better randomness
  const buffer = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buffer);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
  }
  
  const view = new DataView(buffer.buffer);
  let random = view.getBigUint64(0, false);
  
  // Scale to max
  return random % max;
}

/**
 * ID represents a 64-bit smolid identifier
 */
export class ID {
  private n: bigint;

  constructor(n: bigint) {
    this.n = n;
  }

  /**
   * Returns the canonical string representation of the ID (lowercase base32, no padding)
   */
  toString(): string {
    return base32Encode(this.toBytes()).toLowerCase();
  }

  /**
   * Returns the version of the ID
   */
  version(): number {
    return Number((this.n & VERSION_MASK) >> VERSION_SHIFT_OFFSET);
  }

  /**
   * Returns the raw 64-bit integer representation of the ID as a Uint8Array (8 bytes)
   */
  toBytes(): Uint8Array {
    const bytes = new Uint8Array(8);
    const view = new DataView(bytes.buffer);
    view.setBigUint64(0, this.n, false); // big-endian
    return bytes;
  }

  /**
   * Returns the time embedded in the ID, with millisecond precision
   */
  toTime(): Date {
    const ms = Number((this.n >> TIMESTAMP_SHIFT_OFFSET) + EPOCH);
    return new Date(ms);
  }

  /**
   * Returns the type identifier embedded in the ID, if any.
   * Throws an error if the ID was not created with NewWithType.
   */
  getType(): number {
    if (!this.isTyped()) {
      throw ErrUntyped;
    }
    const typ = this.n & V1_TYPE_MASK;
    return Number(typ >> V1_TYPE_SHIFT_OFFSET);
  }

  /**
   * Returns true if the ID was created with NewWithType
   */
  isTyped(): boolean {
    return (this.n & V1_TYPE_FLAG) !== 0n;
  }

  /**
   * Returns true if the ID is typed and matches the given type identifier.
   * Throws an error if the ID was not created with NewWithType.
   */
  isOfType(typ: number): boolean {
    if (!this.isTyped()) {
      throw ErrUntyped;
    }
    if (typ > Number(V1_TYPE_SIZE)) {
      throw ErrInvalidType;
    }
    
    const typ2 = this.getType();
    return typ === typ2;
  }

  /**
   * Returns the raw 64-bit integer representation of the ID
   */
  toBigInt(): bigint {
    return this.n;
  }

  /**
   * Returns the raw 64-bit integer representation of the ID as a number
   * Note: This may lose precision for very large IDs
   */
  toNumber(): number {
    return Number(this.n);
  }
}

/**
 * Returns a new smolid.ID v1 with all defaults
 */
export function New(): ID {
  const now = BigInt(Date.now());
  let id = ((now - EPOCH) << TIMESTAMP_SHIFT_OFFSET); // set the timestamp
  id |= V1_VERSION; // set the version bit
  id |= randomBigInt(V1_RANDOM_SPACE); // random-fill the remaining space
  return new ID(id);
}

/**
 * Returns a nil (zero) ID
 */
export function Nil(): ID {
  return new ID(0n);
}

/**
 * Returns a new smolid.ID v1 with the given type identifier embedded into the ID
 */
export function NewWithType(typ: number): ID {
  if (typ > Number(V1_TYPE_SIZE)) {
    throw ErrInvalidType;
  }
  
  const id = New(); // get a new v1 ID
  id['n'] &= ~V1_TYPE_MASK; // clear the random data in the type space
  id['n'] |= V1_TYPE_FLAG; // set the type flag
  id['n'] |= BigInt(typ) << V1_TYPE_SHIFT_OFFSET; // set the type
  return id;
}

/**
 * Parses a smolid.ID from a string. While the canonical representation is all-lowercase,
 * the parser is case-insensitive and will accept uppercase or mixed case without problems.
 */
export function FromString(s: string): ID {
  const bytes = base32Decode(s);
  const view = new DataView(bytes.buffer);
  const n = view.getBigUint64(0, false); // big-endian
  return new ID(n);
}

/**
 * A convenience function that throws if the given ID operation failed.
 * Useful for testing or scenarios where you know fully that an ID is valid.
 */
export function Must<T>(fn: () => T): T {
  try {
    return fn();
  } catch (err) {
    throw new SmolIDError(`couldn't parse id: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Export default object for easier usage
export default {
  New,
  Nil,
  NewWithType,
  FromString,
  Must,
  ID,
  SmolIDError,
  ErrUntyped,
  ErrInvalidType,
};
