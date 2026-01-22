# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2026-01-21

### Added

- Minified IIFE bundle for browser usage
- Updated documentation and examples to use the minified browser bundle

## [1.0.0] - 2026-01-21

### Added

- Initial implementation of smolid-js
- JavaScript/TypeScript implementation of the smolid ID scheme
- Support for multiple platforms:
  - Node.js (ESM and CommonJS)
  - Web browsers (IIFE bundle)
  - Deno
- Core functionality:
  - `New(timestamp?)` - Generate new smolid v1 with optional custom timestamp
  - `Nil()` - Create nil (zero) ID
  - `NewWithType(typ, timestamp?)` - Generate ID with embedded type identifier and optional custom timestamp
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
- Integration test suite for multi-platform verification
- Test suite for Deno
- Examples for all platforms
- Full TypeScript definitions
- Documentation and README

### Fixed

- Improved JSDoc and corrected misleading comments

[1.0.1]: https://github.com/mirorac/smolid-js/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/mirorac/smolid-js/releases/tag/v1.0.0
