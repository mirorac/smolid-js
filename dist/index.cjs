"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ErrInvalidType: () => ErrInvalidType,
  ErrUntyped: () => ErrUntyped,
  FromString: () => FromString,
  ID: () => ID,
  Must: () => Must,
  New: () => New,
  NewWithType: () => NewWithType,
  Nil: () => Nil,
  SmolIDError: () => SmolIDError,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var EPOCH = 1735707600000n;
var TIMESTAMP_SIZE = 0b11111111111111111111111111111111111111111n;
var TIMESTAMP_SHIFT_OFFSET = 23n;
var TIMESTAMP_MASK = TIMESTAMP_SIZE << TIMESTAMP_SHIFT_OFFSET;
var VERSION_SHIFT_OFFSET = 21n;
var VERSION_MASK = 0b11n << VERSION_SHIFT_OFFSET;
var V1_TYPE_SHIFT_OFFSET = 9n;
var V1_TYPE_FLAG = 0b1n << 20n;
var V1_TYPE_SIZE = 0b1111111n;
var V1_TYPE_MASK = V1_TYPE_SIZE << V1_TYPE_SHIFT_OFFSET;
var V1_RANDOM_SPACE = 0xfffffn;
var V1_VERSION = 0b1n << 21n;
var BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
var BASE32_DECODE_MAP = {};
for (let i = 0; i < BASE32_CHARS.length; i++) {
  BASE32_DECODE_MAP[BASE32_CHARS[i]] = i;
  BASE32_DECODE_MAP[BASE32_CHARS[i].toLowerCase()] = i;
}
var SmolIDError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "SmolIDError";
  }
};
var ErrUntyped = new SmolIDError("no type id is embedded");
var ErrInvalidType = new SmolIDError(`invalid type id: must be less than or equal to ${V1_TYPE_SIZE}`);
function base32Encode(bytes) {
  let bits = 0;
  let value = 0;
  let output = "";
  for (let i = 0; i < bytes.length; i++) {
    value = value << 8 | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_CHARS[value >>> bits - 5 & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_CHARS[value << 5 - bits & 31];
  }
  return output;
}
function base32Decode(str) {
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
    value = value << 5 | BASE32_DECODE_MAP[char];
    bits += 5;
    if (bits >= 8) {
      output[index++] = value >>> bits - 8 & 255;
      bits -= 8;
    }
  }
  return output;
}
function randomBigInt(max) {
  const buffer = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(buffer);
  } else {
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
  }
  const view = new DataView(buffer.buffer);
  let random = view.getBigUint64(0, false);
  return random % max;
}
var ID = class {
  constructor(n) {
    this.n = n;
  }
  /**
   * Returns the canonical string representation of the ID (lowercase base32, no padding)
   */
  toString() {
    return base32Encode(this.toBytes()).toLowerCase();
  }
  /**
   * Returns the version of the ID
   */
  version() {
    return Number((this.n & VERSION_MASK) >> VERSION_SHIFT_OFFSET);
  }
  /**
   * Returns the raw 64-bit integer representation of the ID as a Uint8Array (8 bytes)
   */
  toBytes() {
    const bytes = new Uint8Array(8);
    const view = new DataView(bytes.buffer);
    view.setBigUint64(0, this.n, false);
    return bytes;
  }
  /**
   * Returns the time embedded in the ID, with millisecond precision
   */
  toTime() {
    const ms = Number((this.n >> TIMESTAMP_SHIFT_OFFSET) + EPOCH);
    return new Date(ms);
  }
  /**
   * Returns the type identifier embedded in the ID, if any.
   * Throws an error if the ID was not created with NewWithType.
   */
  getType() {
    if (!this.isTyped()) {
      throw ErrUntyped;
    }
    const typ = this.n & V1_TYPE_MASK;
    return Number(typ >> V1_TYPE_SHIFT_OFFSET);
  }
  /**
   * Returns true if the ID was created with NewWithType
   */
  isTyped() {
    return (this.n & V1_TYPE_FLAG) !== 0n;
  }
  /**
   * Returns true if the ID is typed and matches the given type identifier.
   * Throws an error if the ID was not created with NewWithType.
   */
  isOfType(typ) {
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
  toBigInt() {
    return this.n;
  }
  /**
   * Returns the raw 64-bit integer representation of the ID as a number
   * Note: This may lose precision for very large IDs
   */
  toNumber() {
    return Number(this.n);
  }
};
function New() {
  const now = BigInt(Date.now());
  let id = now - EPOCH << TIMESTAMP_SHIFT_OFFSET;
  id |= V1_VERSION;
  id |= randomBigInt(V1_RANDOM_SPACE);
  return new ID(id);
}
function Nil() {
  return new ID(0n);
}
function NewWithType(typ) {
  if (typ > Number(V1_TYPE_SIZE)) {
    throw ErrInvalidType;
  }
  const id = New();
  id["n"] &= ~V1_TYPE_MASK;
  id["n"] |= V1_TYPE_FLAG;
  id["n"] |= BigInt(typ) << V1_TYPE_SHIFT_OFFSET;
  return id;
}
function FromString(s) {
  const bytes = base32Decode(s);
  const view = new DataView(bytes.buffer);
  const n = view.getBigUint64(0, false);
  return new ID(n);
}
function Must(fn) {
  try {
    return fn();
  } catch (err) {
    throw new SmolIDError(`couldn't parse id: ${err instanceof Error ? err.message : String(err)}`);
  }
}
var index_default = {
  New,
  Nil,
  NewWithType,
  FromString,
  Must,
  ID,
  SmolIDError,
  ErrUntyped,
  ErrInvalidType
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ErrInvalidType,
  ErrUntyped,
  FromString,
  ID,
  Must,
  New,
  NewWithType,
  Nil,
  SmolIDError
});
