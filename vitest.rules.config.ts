import { defineConfig } from "vitest/config";

// Rules tests need the Firestore emulator, so they run through `npm run
// test:rules` rather than the default unit-test run.
export default defineConfig({
  test: {
    include: ["src/utils/firebaseUtils.rules.ts"],
    environment: "node",
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
