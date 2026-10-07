# conversation-topics

An open dataset of **910 conversation topics, icebreakers, debate motions, ESL speaking prompts, deep questions and writing prompts**, in one JSON file, plus a tiny dependency-free picker that never repeats a topic within a session.

Every entry is hand-written and tagged by **category** (what you use it for), **audience** (who it suits) and **depth** (light, medium, deep). Debate and speech topics come with talking points; ESL prompts come with follow-up questions.

- Data: [`data/topics.json`](data/topics.json), one topic per line. Use it from any language.
- Code: [`src/index.js`](src/index.js), ESM with TypeScript types. Node 20.10+ or a modern browser.

## What's inside

| category | general | students | kids | esl | workplace | total |
|---|---|---|---|---|---|---|
| icebreaker | 112 | 67 | 78 | 0 | 44 | 234 |
| conversation | 369 | 263 | 78 | 60 | 4 | 511 |
| deep-question | 49 | 0 | 0 | 0 | 0 | 49 |
| debate | 308 | 308 | 8 | 18 | 4 | 338 |
| speech | 296 | 296 | 0 | 0 | 0 | 296 |
| writing-prompt | 70 | 53 | 6 | 0 | 0 | 76 |
| journal | 95 | 95 | 0 | 0 | 0 | 95 |

A topic can have several categories and audiences, so columns don't add up to 910.

- **Audiences:** `general` (adults, mixed groups), `students` (high school and college: debate, speech, essays), `kids` (roughly ages 6 to 12, classroom and family), `esl` (English learners; `depth` doubles as level: light = beginner, medium = intermediate, deep = advanced), `workplace` (team meetings and stand-ups).
- **Tags:** a subject for the debate/speech/conversation topics (`science`, `technology`, `philosophy`, `psychology`, `history`, `art-culture`, `food-travel`, `relationships`, `education`, `politics`, `entertainment`, `sports`, `business`, `nature`, `health`, `weird-fun`) or a theme for the rest (`classroom`, `team`, `reflection`, `fiction`, `gratitude`, `self-discovery`, `beginner`, ...).

### Schema

```json
{"id":"ct-0001","text":"The ethics of gene editing in human embryos","categories":["conversation","debate"],"audiences":["general","students"],"depth":"deep","tags":["science"],"talkingPoints":["CRISPR technology capabilities","Designer babies controversy","Medical vs enhancement uses"]}
{"id":"ct-0728","text":"What do you usually eat for breakfast?","categories":["conversation"],"audiences":["esl"],"depth":"light","tags":["beginner"],"followUps":["Do you eat at home or on the way?","What did you eat for breakfast as a child?","What is a typical breakfast in your country?"]}
```

| field | type | notes |
|---|---|---|
| `id` | string | `ct-0001` ... stable; never reused |
| `text` | string | the topic or question |
| `categories` | string[] | `icebreaker`, `conversation`, `deep-question`, `debate`, `speech`, `writing-prompt`, `journal` |
| `audiences` | string[] | `general`, `students`, `kids`, `esl`, `workplace` |
| `depth` | string | `light`, `medium`, `deep` |
| `tags` | string[] | subject or theme, lowercase |
| `talkingPoints` | string[]? | angles to cover (debate, speech, discussion) |
| `followUps` | string[]? | follow-up questions (ESL prompts) |

## Picker

```sh
git clone https://github.com/jackships/conversation-topics.git
cd conversation-topics
npm test
node examples/cli.js --category icebreaker --audience workplace -n 3
node examples/cli.js --audience esl --depth medium --seed lesson-4
```

```js
import { random, filter, createSession } from "./src/index.js";

random({ category: "debate", audience: "students" });
// { id: "ct-0233", text: "Standardized testing: measuring knowledge or test-taking ability", ... }

random({ category: "deep-question", seed: "2026-10-07" }); // same seed, same topic

filter({ audience: "kids", category: ["icebreaker", "writing-prompt"] }).length; // 84

// No repeats within a session, even across different filters
const session = createSession({ seed: "class-3b" });
session.random({ audience: "esl", depth: "light" });
session.take(5, { category: "icebreaker", audience: "workplace" });
session.remaining({ audience: "esl" }); // how many are left unused
session.reset();
```

| function | does |
|---|---|
| `random(filters & { seed? })` | one matching topic, or `null`. Stateless. |
| `filter(filters)` | every matching topic. |
| `createSession({ seed?, recycle? })` | a picker with `random(filters)`, `take(n, filters)`, `remaining(filters)`, `reset()`. It returns `null` once the matching pool is used up, or starts over if `recycle: true`. |
| `rng(seed)` | the seeded PRNG used internally (FNV-1a + mulberry32). |

Filters: `category`, `audience`, `depth`, `tag` (each one value or an array, matched as "any of") and `search` (case-insensitive substring). Unknown category, audience or depth values throw a `RangeError`, so typos don't silently return nothing.

## Where the topics come from

All entries were written by hand. About 730 of them are the curated lists behind randomtopics.app; the ESL, kids, workplace, deep-question and story prompts were written for this release. Nothing is scraped or machine-generated in bulk. See [CONTRIBUTING.md](CONTRIBUTING.md) to add or fix topics.

## License

- Code (`src/`, `examples/`, `test/`): [MIT](LICENSE) © 2026 Jack Ships
- Data (`data/topics.json`): [CC BY 4.0](data/LICENSE). Use it anywhere, including commercially; credit "conversation-topics by Jack Ships" with a link to this repo.

---

Made by Jack, who also runs [randomtopics.app](https://randomtopics.app), a free random topic generator built on these lists.
