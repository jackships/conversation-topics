import { test } from "node:test";
import assert from "node:assert/strict";
import { random, filter, createSession, rng, topics } from "../src/index.js";

test("filter by category, audience, depth and tag", () => {
  const r = filter({ category: "debate", audience: "kids" });
  assert.ok(r.length > 0);
  for (const t of r) {
    assert.ok(t.categories.includes("debate"));
    assert.ok(t.audiences.includes("kids"));
  }
  const deep = filter({ depth: "deep", tag: "philosophy" });
  assert.ok(deep.length > 0 && deep.every((t) => t.depth === "deep" && t.tags.includes("philosophy")));
});

test("filter values accept arrays (any of)", () => {
  const both = filter({ audience: ["kids", "esl"] });
  assert.equal(both.length, new Set([...filter({ audience: "kids" }), ...filter({ audience: "esl" })]).size);
});

test("filter by search text", () => {
  const r = filter({ search: "BREAKFAST" });
  assert.ok(r.length > 0 && r.every((t) => /breakfast/i.test(t.text)));
});

test("unknown filter values throw", () => {
  assert.throws(() => filter({ category: "trivia" }), RangeError);
  assert.throws(() => random({ audience: "pirates" }), RangeError);
  assert.throws(() => filter({ depth: "abyss" }), RangeError);
});

test("random returns a matching topic, null when nothing matches", () => {
  const t = random({ category: "icebreaker", audience: "workplace" });
  assert.ok(t.categories.includes("icebreaker") && t.audiences.includes("workplace"));
  assert.equal(random({ search: "zzz-no-such-topic" }), null);
});

test("same seed, same pick; different seeds vary", () => {
  assert.deepEqual(random({ seed: "monday" }), random({ seed: "monday" }));
  const picks = new Set(Array.from({ length: 20 }, (_, i) => random({ seed: i }).id));
  assert.ok(picks.size > 10);
});

test("rng is deterministic and in [0, 1)", () => {
  const a = rng("x");
  const b = rng("x");
  for (let i = 0; i < 1000; i++) {
    const v = a();
    assert.equal(v, b());
    assert.ok(v >= 0 && v < 1);
  }
});

test("session never repeats and returns null when exhausted", () => {
  const f = { category: "debate", audience: "kids" };
  const n = filter(f).length;
  const s = createSession({ seed: 1 });
  const ids = new Set();
  for (let i = 0; i < n; i++) {
    const t = s.random(f);
    assert.ok(t);
    assert.ok(!ids.has(t.id), "repeat");
    ids.add(t.id);
  }
  assert.equal(s.remaining(f), 0);
  assert.equal(s.random(f), null);
  s.reset();
  assert.equal(s.remaining(f), n);
});

test("sessions are reproducible with a seed", () => {
  const a = createSession({ seed: "class-3b" }).take(10).map((t) => t.id);
  const b = createSession({ seed: "class-3b" }).take(10).map((t) => t.id);
  assert.deepEqual(a, b);
  assert.equal(new Set(a).size, 10);
});

test("no repeats across different filters in one session", () => {
  const s = createSession({ seed: 7 });
  const ids = [...s.take(30, { audience: "kids" }), ...s.take(30, { category: "icebreaker" })].map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("recycle starts over after exhausting the pool", () => {
  const f = { category: "debate", audience: "kids" };
  const n = filter(f).length;
  const s = createSession({ seed: 2, recycle: true });
  s.take(n, f);
  assert.ok(s.random(f), "recycled pick");
  assert.equal(s.remaining(f), n - 1);
});

test("take stops at pool size", () => {
  const f = { category: "debate", audience: "kids" };
  assert.equal(createSession().take(1000, f).length, filter(f).length);
});

test("topics are frozen", () => {
  assert.throws(() => {
    "use strict";
    topics[0].text = "x";
  }, TypeError);
});
