import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, type Firestore } from "firebase/firestore";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { migrateLikes } from "./firebaseUtils";

const NEW_UID = "new-user";
const OLD_UID = "anon-user";
const POEM_IDS = ["poem-a", "poem-b"];

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-auth-overhaul",
    firestore: {
      rules: readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("like migration", () => {
  it("writes a rule-compliant batch and leaves the stored counter alone", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, "poems", "poem-a"), { likes: 1 });
      await setDoc(doc(adminDb, "poems", "poem-b"), { likes: 1 });
    });

    const userDb = testEnv.authenticatedContext(NEW_UID).firestore();
    const written = await migrateLikes(
      { uid: OLD_UID, poemIds: POEM_IDS },
      NEW_UID,
      // rules-unit-testing carries its own copy of the Firestore type, but the
      // instance is the same client SDK at runtime.
      userDb as unknown as Firestore
    );

    expect(written).toBe(2);

    for (const poemId of POEM_IDS) {
      const like = await getDoc(doc(userDb, "likes", `${poemId}_${NEW_UID}`));
      expect(like.exists()).toBe(true);
      expect(like.data()).toMatchObject({
        poemId,
        userId: NEW_UID,
      });
      expect(typeof like.data()?.timestamp.toDate).toBe("function");

      // The anonymous like already incremented the counter; migration must
      // never increment it again.
      const poem = await getDoc(doc(userDb, "poems", poemId));
      expect(poem.data()?.likes).toBe(1);
    }
  });

  it("writes only the likes the account does not already have", async () => {
    const existingTimestamp = new Date("2020-01-01T00:00:00.000Z");

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, "poems", "poem-a"), { likes: 1 });
      await setDoc(doc(adminDb, "poems", "poem-b"), { likes: 1 });
      await setDoc(doc(adminDb, "likes", `poem-a_${NEW_UID}`), {
        poemId: "poem-a",
        userId: NEW_UID,
        timestamp: existingTimestamp,
      });
    });

    const userDb = testEnv.authenticatedContext(NEW_UID).firestore();

    const written = await migrateLikes(
      { uid: OLD_UID, poemIds: POEM_IDS },
      NEW_UID,
      userDb as unknown as Firestore
    );

    expect(written).toBe(1);

    const alreadyThere = await getDoc(
      doc(userDb, "likes", `poem-a_${NEW_UID}`)
    );
    expect(alreadyThere.data()?.timestamp.toDate().toISOString()).toBe(
      existingTimestamp.toISOString()
    );

    const migrated = await getDoc(doc(userDb, "likes", `poem-b_${NEW_UID}`));
    expect(migrated.exists()).toBe(true);

    // A second run finds everything present and commits no batch at all.
    await expect(
      migrateLikes(
        { uid: OLD_UID, poemIds: POEM_IDS },
        NEW_UID,
        userDb as unknown as Firestore
      )
    ).resolves.toBe(0);
  });

  it("cannot write a like doc for another user", async () => {
    const intruderDb = testEnv.authenticatedContext("someone-else").firestore();

    await assertFails(
      setDoc(doc(intruderDb, "likes", `poem-a_${NEW_UID}`), {
        poemId: "poem-a",
        userId: NEW_UID,
        timestamp: new Date(),
      })
    );
  });

  it("cannot read the old anonymous likes after the uid changes", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "likes", `poem-a_${OLD_UID}`), {
        poemId: "poem-a",
        userId: OLD_UID,
        timestamp: new Date(),
      });
    });

    const userDb = testEnv.authenticatedContext(NEW_UID).firestore();

    await assertFails(getDoc(doc(userDb, "likes", `poem-a_${OLD_UID}`)));
  });
});
