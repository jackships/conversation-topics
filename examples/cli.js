#!/usr/bin/env node
// Usage: node examples/cli.js [--category debate] [--audience students] [--depth deep] [--tag science] [-n 5] [--seed abc]
import { createSession, CATEGORIES, AUDIENCES, filter } from "../src/index.js";

const args = process.argv.slice(2);
const opts = {};
let n = 1;
let seed;
for (let i = 0; i < args.length; i++) {
  const [k, v] = [args[i], args[i + 1]];
  if (k === "-h" || k === "--help") {
    console.log(`node examples/cli.js [--category C] [--audience A] [--depth D] [--tag T] [-n N] [--seed S]
categories: ${CATEGORIES.join(", ")}
audiences:  ${AUDIENCES.join(", ")}
depths:     light, medium, deep`);
    process.exit(0);
  }
  if (k === "-n") n = Number(v), i++;
  else if (k === "--seed") seed = v, i++;
  else if (k.startsWith("--")) opts[k.slice(2)] = v, i++;
}

try {
  const session = createSession({ seed });
  const picks = session.take(n, opts);
  if (picks.length === 0) {
    console.error("No topics match those filters.");
    process.exit(1);
  }
  for (const t of picks) {
    console.log(`- ${t.text}`);
    for (const p of t.followUps ?? t.talkingPoints ?? []) console.log(`    · ${p}`);
  }
  console.error(`(${filter(opts).length} topics match)`);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
