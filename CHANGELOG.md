# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-21

### Added
- Initial implementation of smolid-js
- JavaScript/TypeScript implementation of the smolid ID scheme
- Support for multiple platforms:
  - Node.js (ESM and CommonJS)
  - Web browsers (IIFE bundle)
  - Deno
- Core functionality:
  - `New()` - Generate new smolid v1
  - `Nil()` - Create nil (zero) ID
  - `NewWithType(typ)` - Generate ID with embedded type identifier
  - `FromString(s)` - Parse ID from base32 string
  - `Must(fn)` - Convenience wrapper for error handling
- ID methods:
  - `toString()` - Canonical lowercase base32 representation
  - `version()` - Get ID version
  - `toBytes()` - Get 8-byte representation
  - `toTime()` - Extract embedded timestamp
  - `getType()` - Get embedded type identifier
  - `isTyped()` - Check if ID has type
  - `isOfType(typ)` - Check if ID matches type
  - `toBigInt()` - Get raw 64-bit integer
  - `toNumber()` - Get as JavaScript number
- Comprehensive test suite for Node.js
- Test suite for Deno
- Examples for all platforms
- Full TypeScript definitions
- Documentation and README

[1.0.0]: https://github.com/mirorac/smolid-js/releases/tag/v1.0.0
