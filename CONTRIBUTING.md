# Contributing

Additions and fixes are welcome. Open a pull request that edits `data/topics.json` and run `npm test` first.

**Adding a topic**

- One topic per line, appended at the end. Give it the next free id (`ct-0911`, `ct-0912`, ...). Never renumber or reuse ids, since people store them.
- Write it yourself. No copying from books, websites or other lists, and no bulk AI output. The data is CC BY 4.0, so you must have the right to license what you add.
- Set at least one `category` and one `audience`, a `depth`, and lowercase `tags` (reuse existing tags where possible).
- ESL prompts need `followUps`: two or three short, simple follow-up questions.
- Keep it usable in a classroom or an office: no sexual content, slurs, or questions that put one person on the spot about health, money, religion or trauma.

**Fixing a topic**

Typos, unclear wording, a wrong audience or a dated reference: edit the line in place and keep the `id`.

**What the tests check**

Schema and allowed values, unique ids, no near-duplicate texts (case and punctuation are ignored), no missing apostrophes, and that ESL prompts have follow-ups.

By contributing you agree that your additions are released under CC BY 4.0 (data) or MIT (code).
