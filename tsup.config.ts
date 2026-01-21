import { defineConfig } from "tsup";

export default defineConfig([
  // ESM and CJS builds
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    outDir: "dist",
  },
  // Browser IIFE build
  {
    entry: ["src/index.ts"],
    format: ["iife"],
    globalName: "Smolid",
    outDir: "dist",
    minify: false,
    outExtension() {
      return {
        js: ".browser.js",
      };
    },
    noExternal: [/.*/],
  },
  // Browser IIFE build (minified)
  {
    entry: ["src/index.ts"],
    format: ["iife"],
    globalName: "Smolid",
    outDir: "dist",
    minify: true,
    outExtension() {
      return {
        js: ".browser.min.js",
      };
    },
    noExternal: [/.*/],
  },
]);
