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
/**
 * Errors
 */
declare class SmolIDError extends Error {
    constructor(message: string);
}
declare const ErrUntyped: SmolIDError;
declare const ErrInvalidType: SmolIDError;
/**
 * ID represents a 64-bit smolid identifier
 */
declare class ID {
    private n;
    constructor(n: bigint);
    /**
     * Returns the canonical string representation of the ID (lowercase base32, no padding)
     */
    toString(): string;
    /**
     * Returns the version of the ID
     */
    version(): number;
    /**
     * Returns the raw 64-bit integer representation of the ID as a Uint8Array (8 bytes)
     */
    toBytes(): Uint8Array;
    /**
     * Returns the time embedded in the ID, with millisecond precision
     */
    toTime(): Date;
    /**
     * Returns the type identifier embedded in the ID, if any.
     * Throws an error if the ID was not created with NewWithType.
     */
    getType(): number;
    /**
     * Returns true if the ID was created with NewWithType
     */
    isTyped(): boolean;
    /**
     * Returns true if the ID is typed and matches the given type identifier.
     * Throws an error if the ID was not created with NewWithType.
     */
    isOfType(typ: number): boolean;
    /**
     * Returns the raw 64-bit integer representation of the ID
     */
    toBigInt(): bigint;
    /**
     * Returns the raw 64-bit integer representation of the ID as a number
     * Note: This may lose precision for very large IDs
     */
    toNumber(): number;
}
/**
 * Returns a new smolid.ID v1 with all defaults
 * @param timestamp Optional timestamp in milliseconds since Unix epoch (defaults to Date.now()).
 *                  Valid range: 2025-01-01 00:00:00 (1735707600000) to 2094-09-07 15:47:35 (3930649655000)
 */
declare function New(timestamp?: number): ID;
/**
 * Returns a nil (zero) ID
 */
declare function Nil(): ID;
/**
 * Returns a new smolid.ID v1 with the given type identifier embedded into the ID
 * @param typ Type identifier (0-127)
 * @param timestamp Optional timestamp in milliseconds since Unix epoch (defaults to Date.now()).
 *                  Valid range: 2025-01-01 00:00:00 (1735707600000) to 2094-09-07 15:47:35 (3930649655000)
 */
declare function NewWithType(typ: number, timestamp?: number): ID;
/**
 * Parses a smolid.ID from a string. While the canonical representation is all-lowercase,
 * the parser is case-insensitive and will accept uppercase or mixed case without problems.
 */
declare function FromString(s: string): ID;
/**
 * A convenience function that throws if the given ID operation failed.
 * Useful for testing or scenarios where you know fully that an ID is valid.
 */
declare function Must<T>(fn: () => T): T;
declare const _default: {
    New: typeof New;
    Nil: typeof Nil;
    NewWithType: typeof NewWithType;
    FromString: typeof FromString;
    Must: typeof Must;
    ID: typeof ID;
    SmolIDError: typeof SmolIDError;
    ErrUntyped: SmolIDError;
    ErrInvalidType: SmolIDError;
};

export { ErrInvalidType, ErrUntyped, FromString, ID, Must, New, NewWithType, Nil, SmolIDError, _default as default };
