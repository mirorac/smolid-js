# Smolid Examples

This directory contains examples of using smolid-js across different platforms.

## Node.js Example

Run with Node.js:

```bash
node examples/node-example.js
```

## Browser Example

Open the `browser-example.html` file in your web browser, or serve it with a local web server:

```bash
# Using Python's built-in HTTP server
python3 -m http.server 8000

# Or using Node.js http-server (install with: npm install -g http-server)
http-server

# Then open http://localhost:8000/examples/browser-example.html
```

## Deno Example

Run with Deno (requires Deno to be installed):

```bash
deno run examples/deno-example.ts
```

Or run the Deno test:

```bash
npm run test:deno
```

## What Each Example Demonstrates

All examples demonstrate:
- Generating new IDs
- Generating typed IDs
- Parsing IDs from strings (case-insensitive)
- Extracting information from IDs (timestamp, version, type)
- ID uniqueness

The browser example provides an interactive UI to explore these features.
