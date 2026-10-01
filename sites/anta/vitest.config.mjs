import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dir = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  test: { include: ["tests/unit/**/*.test.js"], environment: "node" },
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${dir("./src/")}` },
      { find: /^@messages\//, replacement: `${dir("./messages/")}` },
      { find: /^@content\//, replacement: `${dir("./content/")}` },
      { find: /^server-only$/, replacement: dir("./tests/unit/server-only-stub.js") }
    ]
  }
});
