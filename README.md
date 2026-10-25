# Ask Dad

Warm open-ended Q&A for the Schmidt Family House.

**Ask Dad anything. He answers from what he’s lived.**

Equal always. Always, always, always.

## Concept

Family (or anyone) can ask Weston / Dad any question — including hard subjects — with a subject tag. Dad answers later, from real life experience. Answered Q&As stay as a growing library.

This is **not** a therapy product, crisis line, or AI answer bot. No auto-answers. No Wikipedia scrapes. Lived answers only.

Sibling to `ask-me/` (different job: that one is a plain-words helper; this one is Dad’s mailbox).

## Local run

```bash
python3 -m http.server 8784 --bind 0.0.0.0 --directory /home/box/library/made/ask-dad
```

Open: http://127.0.0.1:8784/ (or the machine’s LAN IP on :8784)

## Modes

1. **Ask** — question + tag (seed tags or custom). Lands in Dad’s open inbox.
2. **Open** — Dad’s inbox. Unlock Dad mode (local PIN / “I’m Dad”) to write answers.
3. **Answers** — browse answered Q&As by tag.

## LocalStorage schema

Key: `askDad.questions.v1`

```json
{
  "id": "uuid",
  "text": "question text",
  "tag": "Life",
  "askedAt": "ISO-8601",
  "status": "open|answered",
  "answer": "optional when answered",
  "answeredAt": "optional ISO-8601"
}
```

Dad PIN: `askDad.dadPin.v1` (local only — not real security; keeps kids from editing by accident).  
Dad session: `askDad.dadSession.v1` (sessionStorage).

## Seed tags

Mental health · Abuse · Recovery · Loneliness · Family · Music · Life · Other (+ custom)

## How Dad answers

1. Open the **Open** tab.
2. Tap **I’m Dad** (first time sets a PIN; later times need that PIN).
3. Write the answer in the box under an open question.
4. **Save answer** — it moves to the Answers library.

Clear site data in the browser to reset the PIN.

## How Ada can extend (keep it buildable)

- Sync open questions to a shared folder / Drive later (today: per-browser LocalStorage).
- Export / import JSON of the question list for backup.
- Optional voice-to-text on the Ask form (same pattern as ask-me).
- Do **not** wire an LLM or web search into answers. Dad’s words stay primary.
- Do **not** add crisis-product framing or 988 UI in this house app.

## Design notes

Warm cream / plum / gold. Letter-desk feel. Not clinical. Not blocks-and-bubbles chat chrome.

## House rules baked in

- No 988 / crisis-product UI.
- No inventing trauma details into sample content.
- No sexual content involving minors anywhere in the app.
- Equal always.

## Pages

GitHub Pages (when published): `https://schmidtweston-ship-it.github.io/ask-dad/`
