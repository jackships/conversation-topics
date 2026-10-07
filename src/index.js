import data from "../data/topics.json" with { type: "json" };

/** Every topic in the dataset (frozen). */
export const topics = Object.freeze(data.map((t) => Object.freeze(t)));

export const CATEGORIES = Object.freeze(["icebreaker", "conversation", "deep-question", "debate", "speech", "writing-prompt", "journal"]);
export const AUDIENCES = Object.freeze(["general", "students", "kids", "esl", "workplace"]);
export const DEPTHS = Object.freeze(["light", "medium", "deep"]);

/** Seeded PRNG: string or number seed -> function returning floats in [0, 1). */
export function rng(seed) {
  // FNV-1a hash of the seed string, then mulberry32.
  let h = 2166136261 >>> 0;
  for (const ch of String(seed)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  let a = h;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const asList = (v) => (v === undefined || v === null ? null : Array.isArray(v) ? v : [v]);

function check(name, values, allowed) {
  if (!values || !allowed) return;
  for (const v of values) if (!allowed.includes(v)) throw new RangeError(`Unknown ${name} "${v}". Use one of: ${allowed.join(", ")}`);
}

/**
 * Topics matching every given filter. Each filter accepts one value or an array (any-of).
 * @param {{category?, audience?, depth?, tag?, search?}} [opts]
 */
export function filter(opts = {}, list = topics) {
  const category = asList(opts.category);
  const audience = asList(opts.audience);
  const depth = asList(opts.depth);
  const tag = asList(opts.tag);
  check("category", category, CATEGORIES);
  check("audience", audience, AUDIENCES);
  check("depth", depth, DEPTHS);
  const search = opts.search ? String(opts.search).toLowerCase() : null;
  return list.filter(
    (t) =>
      (!category || t.categories.some((c) => category.includes(c))) &&
      (!audience || t.audiences.some((a) => audience.includes(a))) &&
      (!depth || depth.includes(t.depth)) &&
      (!tag || t.tags.some((x) => tag.includes(x))) &&
      (!search || t.text.toLowerCase().includes(search)),
  );
}

/**
 * One random topic matching the filters, or null when nothing matches.
 * Pass `seed` for a reproducible pick. Stateless: repeats are possible across calls;
 * use createSession() to avoid them.
 */
export function random(opts = {}) {
  const pool = filter(opts);
  if (pool.length === 0) return null;
  const r = opts.seed === undefined ? Math.random : rng(opts.seed);
  return pool[Math.floor(r() * pool.length)];
}

/**
 * A picker that never returns the same topic twice.
 * @param {{seed?: string|number, recycle?: boolean}} [opts]
 *   recycle: when every matching topic has been used, start over instead of returning null.
 */
export function createSession(opts = {}) {
  const r = opts.seed === undefined ? Math.random : rng(opts.seed);
  const used = new Set();
  return {
    /** Next unused topic matching the filters, or null when they are exhausted. */
    random(filters = {}) {
      const pool = filter(filters);
      if (pool.length === 0) return null;
      let fresh = pool.filter((t) => !used.has(t.id));
      if (fresh.length === 0) {
        if (!opts.recycle) return null;
        for (const t of pool) used.delete(t.id);
        fresh = pool;
      }
      const pick = fresh[Math.floor(r() * fresh.length)];
      used.add(pick.id);
      return pick;
    },
    /** Up to n unused topics. */
    take(n, filters = {}) {
      const out = [];
      for (let i = 0; i < n; i++) {
        const t = this.random(filters);
        if (!t || (opts.recycle && out.includes(t))) break;
        out.push(t);
      }
      return out;
    },
    /** How many matching topics have not been used yet. */
    remaining(filters = {}) {
      return filter(filters).filter((t) => !used.has(t.id)).length;
    },
    /** Forget everything picked so far. */
    reset() {
      used.clear();
    },
    get used() {
      return used.size;
    },
  };
}
