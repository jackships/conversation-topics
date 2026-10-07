import { test } from "node:test";
import assert from "node:assert/strict";
import { topics, CATEGORIES, AUDIENCES, DEPTHS } from "../src/index.js";

test("dataset has several hundred topics", () => {
  assert.ok(topics.length >= 800, `only ${topics.length}`);
});

test("every topic follows the schema", () => {
  const keys = new Set(["id", "text", "categories", "audiences", "depth", "tags", "talkingPoints", "followUps"]);
  for (const t of topics) {
    for (const k of Object.keys(t)) assert.ok(keys.has(k), `${t.id}: unexpected field ${k}`);
    assert.match(t.id, /^ct-\d{4}$/);
    assert.equal(typeof t.text, "string");
    assert.ok(t.text.length >= 8 && t.text.length <= 200, `${t.id}: text length`);
    assert.equal(t.text, t.text.trim(), `${t.id}: whitespace`);
    assert.ok(t.categories.length > 0 && t.categories.every((c) => CATEGORIES.includes(c)), `${t.id}: categories`);
    assert.ok(t.audiences.length > 0 && t.audiences.every((a) => AUDIENCES.includes(a)), `${t.id}: audiences`);
    assert.equal(new Set(t.categories).size, t.categories.length, `${t.id}: duplicate category`);
    assert.ok(DEPTHS.includes(t.depth), `${t.id}: depth`);
    assert.ok(Array.isArray(t.tags) && t.tags.every((x) => /^[a-z][a-z-]*$/.test(x)), `${t.id}: tags`);
    for (const k of ["talkingPoints", "followUps"]) {
      if (k in t) assert.ok(Array.isArray(t[k]) && t[k].length > 0 && t[k].every((s) => typeof s === "string" && s.length > 0), `${t.id}: ${k}`);
    }
  }
});

test("ids and texts are unique", () => {
  assert.equal(new Set(topics.map((t) => t.id)).size, topics.length);
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const seen = new Map();
  for (const t of topics) {
    const k = norm(t.text);
    assert.ok(!seen.has(k), `${t.id} duplicates ${seen.get(k)}`);
    seen.set(k, t.id);
  }
});

test("no missing apostrophes in common contractions", () => {
  for (const t of topics) assert.doesNotMatch(t.text, /\b(dont|doesnt|isnt|cant|wont|didnt|shouldnt|wouldnt|whats)\b/i, t.id);
});

test("every category and audience is populated", () => {
  for (const c of CATEGORIES) assert.ok(topics.filter((t) => t.categories.includes(c)).length >= 20, c);
  for (const a of AUDIENCES) assert.ok(topics.filter((t) => t.audiences.includes(a)).length >= 20, a);
});

test("ESL prompts all carry follow-up questions", () => {
  const esl = topics.filter((t) => t.audiences.includes("esl"));
  assert.ok(esl.length >= 50);
  for (const t of esl) assert.ok(t.followUps?.length >= 2, t.id);
});
