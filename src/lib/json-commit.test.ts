import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { commitWithRetry } from "./json-commit";

describe("commitWithRetry", () => {
  it("reapplies the mutation after a concurrent write wins", async () => {
    let store = ["a"];
    let writes = 0;
    const saved = await commitWithRetry({
      read: async () => store.slice(),
      write: async (next) => {
        writes += 1;
        if (writes === 1) {
          store = ["a", "intruder"];
          return;
        }
        store = next;
      },
      mutate: (current) =>
        current.includes("ours") ? current : [...current, "ours"],
      persisted: (current) => current.includes("ours"),
    });

    assert.deepEqual(saved, ["a", "intruder", "ours"]);
    assert.equal(writes, 2);
  });

  it("does not write again when the row is already present", async () => {
    let writes = 0;
    const saved = await commitWithRetry({
      read: async () => ["ours"],
      write: async () => {
        writes += 1;
      },
      mutate: (current) => [...current, "ours"],
      persisted: (current) => current.includes("ours"),
    });
    assert.deepEqual(saved, ["ours"]);
    assert.equal(writes, 0);
  });
});
