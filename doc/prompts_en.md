# 📦 Gemini CLI Prompt Package (English Version)

## 🧰 0) One-Shot Bootstrap (Project Bootstrap)

**Goal:** Scaffold a Windows 3.1–styled React+TS game project using Vite + React DOM/CSS + Zustand + TanStack Query, with Supabase client, Vitest/Playwright, ESLint/Prettier, and initial folders.

```
Create a new Vite React+TypeScript project named "Venazia".
Add dependencies: zustand, @tanstack/react-query, clsx.
Add dev deps: vitest, @vitest/ui, jsdom, @testing-library/react, @testing-library/user-event, playwright, eslint, prettier, @types/node, @types/react, @types/react-dom.

Project structure (create all files with minimal working content):
src/
  app/
    screens/Welcome.tsx
    screens/Game.tsx
    components/Window.tsx
    components/Button.tsx
    components/Input.tsx
    components/Modal.tsx
  game/
    components/Word.tsx
    components/GameArea.tsx
    engine/gameLoop.ts
    systems/Spawn.ts
    systems/Move.ts
    systems/Collision.ts
    systems/Scoring.ts
    state/useGameStore.ts
  data/
    supabaseClient.ts
    queries/stage.ts
    queries/scores.ts
  design-tokens/tokens.css
  domains/ime.ts
  domains/stage.ts
  domains/wordgen.ts
  utils/time.ts
  main.tsx
  App.tsx
.env.example (SUPABASE_URL=, SUPABASE_ANON_KEY=)

Initialize:
- React Router (Welcome → Game).
- Zustand store for game state (score, stage, blocksLeft, timer, words).
- TanStack Query client in App.
- tokens.css with Windows 3.1-like variables (colors, bevel).
- ESLint/Prettier/Vitest config.
- Playwright config with a sample E2E test.

Acceptance:
- `pnpm dev` compiles.
- Visiting / shows Welcome; Start Game goes to /game.
- The main game area (a div) mounts in the Game screen.
- Tests run: `pnpm test`, `pnpm exec playwright test`.
```

---

## 🧱 1) Core Loop (Word Spawn/Fall/Collision/Game Over)

```
Implement the game area in src/game using React DOM and CSS:
- 12 columns (using CSS Grid or Flexbox) and a ground position.
- Word component: {id, text, column, position}. Rendered as a DOM element.
- Spawn system: every `spawnInterval` ms (from stage settings, e.g., 3000ms for stage 1) create a new word state with a random column.
- Move system: Animate words falling from top to bottom using CSS Transitions or Keyframe Animations. The animation duration will be set by the current stage's `fallDuration`.
- Collision with ground: Use animation events (`onAnimationEnd`) or `getBoundingClientRect` within a `requestAnimationFrame` loop to detect when a word reaches the ground. On collision, reduce blocksLeft in the matching column; if total destroyed blocks === 12, trigger Game Over.
Targeting rule: The current input is checked against all visible words. If the input fully matches the text of any word, that word is removed and scored.
- Scoring formula (Phase 1): score += word.length * stage * 10. (The more complex keystroke-based calculation will be handled in a later refactoring step.)

Provide dummy stage settings in code for now: `fallDuration` and `spawnInterval` from an array by stage.
Expose hooks/events to React to render HUD (score, stage, blocksLeft, time).

Acceptance:
- Word components visually fall, collide with the ground, and are removed.
- Words are spawned according to the stage's `spawnInterval`.
- Removing all 12 blocks ends the game and shows a Game Over signal to React.
```

---

## ⌨️ 2) IME-Safe Input

```
Implement input handling using a hidden <input> with composition events:
- Never compare on keydown.
- Use compositionstart/update/end and input events.
- Normalize to NFC and compare completed syllables only.
- Maintain an input buffer bound to the active target; on full match remove the word component, award score, and clear buffer.
- Expose controlled input value to React for a translucent overlay display.

Acceptance:
- During composition, no premature matching.
- After composition end, matching is correct for Korean syllables.
- Mixed ASCII/Korean cases do not break.
```

---

## 🪟 3) UI Flow & Retro Styling

```
Build Windows 3.1-like UI:
- tokens.css: primary palette, bevel shadows (outset/inset), font stacks (Neo둥근모 fallback to Dotum).
- Components: Window, Button, Input, Modal with bevel borders and flat colors.
- Screens:
  - Welcome: nickname input (localStorage persistence), Start button, View Rankings button.
  - Game HUD: stage, score, blocksLeft, stopwatch (MM:SS.s).
  - Game Over modal: "Retry", "Back to Main".
- Stage clear modal: pause and show 3-second countdown.

Acceptance:
- UI visually matches retro spec (bevels, palette).
- Welcome → Game → GameOver flow works.
- Nickname persists via localStorage.
```

---

## 🗄 4) Supabase Read (stage_settings and Rankings)

```
Add Supabase client with env vars: SUPABASE_URL, SUPABASE_ANON_KEY.
Create SQL files:
- stage_settings table (add `spawn_interval_seconds` float column)
- scores table
- index on scores(score desc)
Add queries:
- Load stage_settings by stage to get `fall_duration_seconds`, `spawn_interval_seconds`, and `clear_duration_seconds`.
- Fetch top 10 scores and my best by nickname.
- **Fetch word list for the current stage using `min_level` and `max_level`.**

Note: Only generate SQL and client code. Actual migration will be run manually later.

Acceptance:
- From Welcome/Game, can load stage settings and apply fall/spawn/clear durations.
- Rankings modal shows Top10 and highlights my best if present.
```

---

## 📝 5) Supabase RPC Write (High Score Update)

```
Create RPC: update_high_score(nickname text, play_at text, score int) with security definer.
On conflict by nickname, keep greatest(score) and update play_at and updated_at.
Enable RLS: select to anon; block direct inserts/updates from client.
Game Over flow:
- Call RPC with {nickname, play_at, score}.
- Re-fetch Top10 and my rank. If my current score is not in Top10, show separator and my record below.

Acceptance:
- Only higher scores replace the old record.
- UI follows display rule: Top10 list; if I’m outside, show my record separately below a divider.
```

---

## 🧪 6) Tests & Performance

```
Unit tests (Vitest):
- calc animation-duration from fallDuration.
- selectActiveTarget(words, inputPrefix) with ties.
- score(wordLen, stage).

E2E (Playwright):
- Survive 60s → stage clear modal with 3..2..1.
- Destroy all 12 blocks → Game Over modal.
- Rankings modal: Top10 + my record display rule.

Perf:
- Ensure smooth animations (e.g., using CSS `transform` for movement) and efficient React re-renders to maintain performance on mid-tier machines.

Acceptance:
- All unit and E2E tests pass locally.
```

--- 

## ✨ 7) Refactor Pass (Scoring)

**Goal:** Enhance the scoring system from a simple length-based calculation to a more accurate keystroke-based model.

**Context:** The initial implementation uses `word.length` for simplicity to quickly build the core game loop. This refactoring task addresses the original PRD requirement for a more realistic scoring system.

**Requirements:**
- Create a utility function, e.g., `calculateKeystrokes(word: string): number`.
- This function should analyze the input string and return the estimated number of keystrokes required to type it on a standard Korean 2-set and English QWERTY keyboard.
- **Korean:** Decompose syllables into their constituent Jamo (e.g., '한' -> 'ㅎ', 'ㅏ', 'ㄴ'). Account for double consonants (e.g., 'ㄲ') and complex vowels (e.g., 'ㅘ') that require multiple key presses.
- **English:** Account for uppercase letters and special characters that require the `Shift` key, counting them as 2 strokes.
- Update the scoring logic in the `useGameLogic` hook to use this new utility function instead of `word.length`.

**Acceptance:**
- `calculateKeystrokes('어제')` returns 4.
- `calculateKeystrokes('Venezia')` returns 8 (counting the capital 'V').
- The in-game score reflects the new, more accurate calculation.
```