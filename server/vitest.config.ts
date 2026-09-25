import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The DB-backed integration tests (RUN_DB_INTEGRATION=true) create rooms, join
    // eight teams and drive full games; cold connections exceed the 5s default.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
