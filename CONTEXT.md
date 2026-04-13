# Glow — Habit Tracker App

## Project Context & Design Instructions

This file captures all research, design decisions, and architectural context for the Glow habit tracker app. Use this as the source of truth when iterating on design or implementation.

---

## 1. Research Foundations

### 1.1 Habit Formation Science

**Lally et al. (2010)** — Habit formation takes on average 66 days (range 18–254). Key ingredients: a context cue (time, place, preceding action), behavioral repetition, and a reward. Consistent contexts dramatically improve automaticity.

**The Habit Loop (Duhigg / Wendy Wood)** — Cue → Craving → Routine → Reward. Over time the goal becomes less necessary and the behavior becomes automatic. The app should reinforce the cue-routine-reward loop, not just track "did you do it."

**Keystone Habits** — Some habits influence formation of others. Exercise can lead to better eating. The app should not try to overwhelm the user with too many habits at once.

**43% of daily behavior is habitual** (Wood et al., 2002). The app works *with* this automaticity rather than demanding conscious effort.

### 1.2 The "What-the-Hell Effect" (Critical)

Psychologist Janet Polivy's research on **counterregulatory behavior** shows that when people perceive they've "broken" a rule or streak, they experience an all-or-nothing cognitive shift: "I already blew it, so what the hell." They then abandon the behavior entirely.

**Key implications for this app:**
- Streak-based tracking is psychologically dangerous. The moment a streak breaks, motivation craters.
- Flexible approaches work better. In dieting research, *longitudinal tracking* (weekly rather than daily rigid targets) promotes more consistent self-regulation by allowing variation across days.
- **Self-forgiveness** after a lapse reduces counterregulatory behavior.
- **Self-compassion** rather than guilt is the evidence-based response to imperfection.

**Design mandate:** Never show streak counters. Never visually punish missed days. The "what-the-hell effect" is the single biggest threat to a habit tracker's effectiveness.

### 1.3 Self-Determination Theory (Deci & Ryan)

SDT identifies three innate psychological needs for sustained motivation:

- **Autonomy** — Feeling in control of your choices. The app must never feel like an external taskmaster. Users set their own habits.
- **Competence** — Feeling effective/capable. Provide positive feedback that enhances perceptions of ability, not highlight failures.
- **Relatedness** — Feeling connected. Even in a solo app, this comes from the design "getting you."

**Critical finding:** External rewards (badges, gamification points) can actually *undermine* intrinsic motivation (Deci, 1971). Verbal praise / positive feedback enhances it. Celebration should feel like genuine acknowledgment, not a game mechanic.

### 1.4 Implementation Intentions (Gollwitzer, 1999)

"If-then" plans are enormously effective: "When situation X arises, I will perform response Y." These automate action initiation, removing deliberation.

**For multi-step habits (rituals):** The app should help users define chains. IF I start my bedtime routine, THEN I brush teeth → put in retainer → set sleep timer → get into bed. Each step is a cue for the next.

### 1.5 "Never Miss Twice" (James Clear / Atomic Habits)

Practical synthesis of the what-the-hell effect research: "Missing once is an accident. Missing twice is the start of a new habit." The app should structurally embody this principle rather than streak counting.

### 1.6 Progress Monitoring Without Punishment

Research on goal-setting (Locke & Latham) shows feedback on progress is critical, but framing matters enormously. People who view challenges as threats perform worse; those who frame them as challenges perform better. The app's visual language should frame partial completion as progress, not failure.

### 1.7 Two-Minute Rule

From Atomic Habits: scale habits down until they take two minutes or less. Habits should default to their simplest achievable form. Partial credit is always valid.

---

## 2. Design Concept: "Glow"

### 2.1 Core Concept — The Warmth Calendar

Instead of streaks or checkboxes, each day on a calendar radiates **warmth** based on how much was accomplished. Think heat map:

- **Full/many habits done** → Bright, warm glow (golden/amber)
- **Some habits done** → Softer, warm light (gentle yellow/peach)
- **A few things done** → Faint warm dot (pale cream)
- **Nothing tracked** → Neutral/blank. Not red. Not crossed out. Just a day.

Good days attract attention. Missed days fade into the background.

### 2.2 Multi-Step Habits — The Ritual Model

Complex habits like "sleep hygiene" are modeled as **Rituals** with ordered steps:

```
🌙 Sleep Hygiene Ritual (4 steps)
  ○ Brush teeth
  ○ Put in retainers
  ○ Set sleep timer on screen
  ○ Sleep in bed (not couch)
```

Completing 3 of 4 steps gives partial credit and warmth. The ritual metaphor (vs. "task list") frames it as a practice being cultivated, not a checklist being failed.

### 2.3 Design Principles (All Research-Grounded)

| Principle | Research Basis | Implementation |
|---|---|---|
| No streaks displayed | What-the-hell effect | Show warmth density, never a streak counter |
| Celebrate presence, not perfection | SDT (competence need) | Partial completion adds warmth; any engagement is positive |
| Never miss twice, not "never miss" | Clear / Counterregulatory research | After a blank day, show the next day as opportunity, not the gap as failure |
| User-defined habits | SDT (autonomy need) | Users create and categorize their own habits and rituals |
| Implementation intentions built in | Gollwitzer's research | Rituals structured as if-then chains with a trigger cue |
| Two-Minute Rule compatible | Atomic Habits / Lally | Habits default to simplest form; partial marking always valid |
| Weekly rhythms, not just daily | Flexible tracking research | Some habits are weekly/biweekly/monthly. Calendar accommodates different cadences |
| Positive visual language only | SDT (positive feedback > negative) | No red, no X marks, no broken-streak warnings. Warmth accumulates; nothing subtracted |

### 2.4 What to Avoid (Also Research-Based)

- **Points/XP systems** — Deci's research shows extrinsic token rewards undermine intrinsic motivation
- **Social leaderboards** — Creates controlled motivation (extrinsic), not autonomous
- **"Perfect week" badges** — Directly triggers what-the-hell effect when inevitably missed
- **Notifications that nag** — Perceived as controlling, undermines autonomy (SDT)
- **Complex analytics dashboards** — Adds cognitive burden (Stawarz et al., 2015, found most habit apps are "poorly designed with respect to theory")
- **Anything that decays/dies/punishes absence** — No Tamagotchi anxiety. The app waits.

---

## 3. Alternative Concepts (Not Selected, For Reference)

### Concept B: "Night Sky"
Calendar is a sky filling with stars. Multi-step rituals form constellations. Missed days = natural dark sky. Shooting stars for coming back after a miss. Different habit categories = different star colors. Tone: cosmic, contemplative.

### Concept C: "Living Shelf" (Terracotta)
Habits grow a tiny isometric diorama/terrarium. Each habit places a charming object in a scene. Scenes accumulate into a scrollable collection. Nothing dies or decays. Seasonal backdrops rotate. Tone: cozy, playful, collectible. Highest art asset cost and dev complexity.

**Decision:** Glow selected for best match with research-backed techniques, highest calendar readability, and lowest implementation risk.

---

## 4. App Architecture

### 4.1 Platform: Progressive Web App (PWA)

**Rationale:** User is on Windows PC + iPhone 13 Pro. PWA avoids:
- Need for PC to be running constantly (Expo Go limitation)
- Apple Developer account cost ($99/yr for TestFlight)
- Mac requirement for native iOS builds

PWA installs via Safari → Add to Home Screen. Runs offline via service worker. Full-screen, home screen icon.

**Trade-offs accepted:** No haptics, limited push notifications on iOS. Acceptable for a habit tracker.

**Future migration path:** If native features are needed later, React code is ~90% reusable in a React Native / Expo port.

### 4.2 Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React 19 + Vite 8 | Fast, modern toolchain |
| Language | TypeScript 6 | Type safety for data model |
| Storage | IndexedDB via Dexie.js 4 | Persistent local storage, no server needed, offline-first |
| Styling | CSS (custom properties + gradients) | Full access to gradients, backdrop-filter, animations for glow aesthetic |
| PWA | Manual (sw.js + manifest.json) | vite-plugin-pwa was incompatible with Vite 8; hand-rolled service worker and manifest |
| Deployment | GitHub Pages via GitHub Actions | Auto-deploys on push to main. URL: https://charters.github.io/glow/ |
| Source | https://github.com/charters/glow (public) | GitHub Actions workflow builds + deploys |

### 4.3 Data Model (Actual — Dexie v2)

**Habit**
- id (auto-increment)
- name: string
- emoji: string (selected from tappable grid, not keyboard)
- frequency: 'daily' | 'weekly' | 'biweekly' | 'xperweek'
- dayOfWeek?: number (0=Sun…6=Sat — for weekly/biweekly)
- timesPerWeek?: number (1–7, for xperweek only)
- isRitual: boolean
- sortOrder: number
- createdAt: string (ISO)

**RitualStep**
- id (auto-increment)
- habitId: number (foreign key → Habit)
- label: string
- sortOrder: number

**Completion**
- id (auto-increment)
- habitId: number (foreign key → Habit)
- date: string (YYYY-MM-DD)
- completedAt: string (ISO)
- stepsCompleted?: number[] (ritual step IDs, for rituals)

**Indexes:** `[habitId+date]` compound index on completions for fast lookups.

**Note:** The original data model spec had fields like `type`, `cadence`, `specificDays`, `category`, `triggerCue`, `archived`. These were simplified during implementation. The current model above is what's actually in code.

### 4.4 Views

#### Today (Primary — 95% of usage) ✅ COMPLETE
- Greeting with time-of-day awareness
- Warmth meter at top (gradient bar showing today's completion ratio, pulse animation at 100%)
- Only shows habits due today (based on frequency logic in `isDueToday()`)
- Single tap to complete simple habits; card glows amber on completion
- Rituals expand to show steps; tap individual steps for partial credit
- xperweek habits show weekly progress badge ("2/3 this week") and count toward warmth if done today
- `.just-completed` pulse animation on toggle
- Tap again to undo

#### Calendar (Signature View) ✅ COMPLETE
- Month grid with warmth heat map per day cell
- Gradient: transparent → cream → peach → amber → golden (0→1 warmth ratio)
- Box-shadow glow on high-warmth cells
- Today outlined with warm border
- Tap any past day → DayDetail bottom sheet slides up
- DayDetail allows viewing and retroactively toggling completions (simple habits + ritual steps)
- Month navigation (‹/›) + tap month label to jump to current month
- Future days are disabled/dimmed
- Warmth computation handles rituals (step-level credit) and xperweek (any completion that day counts)

#### Habits (Setup — Infrequent Use) ✅ COMPLETE
- List of all habits with emoji, name, frequency description
- Add new habit form at bottom with:
  - Tappable emoji grid (30 common emojis, no keyboard activation — avoids iOS keyboard covering fields)
  - Name input
  - Frequency selector: Daily / Weekly / Biweekly / X per week
  - Day-of-week picker for weekly/biweekly
  - Stepper (−/+, 1–7×) for xperweek
  - Ritual toggle with dynamic step inputs
- Inline edit: tap Edit button on card → form expands below that card (not at bottom)
- Edit preserves all history (uses `db.habits.update()`, doesn't delete/recreate)
- Delete: inside edit form, "Delete Habit" opens a modal overlay showing emoji, name, creation date, frequency, red warning, Keep / Delete Forever buttons

#### Reflect (Monthly Summary) ⬜ NOT STARTED (placeholder in tab bar)
Planned features from design spec:
- Warm days count: "You had 19 warm days in March"
- Warmth trend sparkline month-over-month
- Strongest habits view
- Ritual step insights (which steps tend to get skipped)
- No scoring, no grades, no prominent percentages

#### Navigation ✅ COMPLETE
```
┌─────────────────────────────┐
│        Active View          │
│        (full screen)        │
├─────────────────────────────┤
│  ☀️ Today  📅 Cal  ⚙️ Habits  💭 │
└─────────────────────────────┘
```
Four emoji tabs. Active tab has warm glow underline.

---

## 5. Build Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Vite + React scaffold, data model (Dexie/IndexedDB), service worker, PWA manifest, Today view with starter habits | ✅ Complete |
| 2 | Calendar view with glow rendering, tap-day detail, retroactive logging | ✅ Complete |
| 3 | Habits view — create, edit, set cadence, build rituals with steps, delete with confirmation | ✅ Complete |
| 4 | Reflection view, export/import backup, glow animations, polish | ⬜ Not started |

---

## 6. Starter Habit Set (Pre-loaded for Phase 1)

**Simple habits:**
- Take out trash (weekly)
- Wash bath towels (weekly)
- Change the sheets (biweekly)

**Rituals:**
- Sleep Hygiene (daily): Don't sleep on couch · Brush teeth · Retainers · Sleep timer on screens

---

## 7. Key Research Sources

- Lally, P., et al. (2010). "How are habits formed." *European Journal of Social Psychology*, 40(6), 998–1009.
- Deci, E. L. (1971). "Effects of externally mediated rewards on intrinsic motivation." *JPSP*, 18, 105–115.
- Ryan, R. M. & Deci, E. L. (2000). "Self-determination theory and the facilitation of intrinsic motivation." *American Psychologist*, 55(1), 68–78.
- Gollwitzer, P. M. (1999). "Implementation intentions: Strong effects of simple plans." *American Psychologist*, 54, 493–503.
- Wood, W., Quinn, J. M., & Kashy, D. A. (2002). "Habits in everyday life." *JPSP*, 83(6), 1281–1297.
- Duhigg, C. (2012). *The Power of Habit*. Random House.
- Clear, J. (2018). *Atomic Habits*. Avery.
- Polivy, J. & Herman, C. P. (2020). "Overeating in Restrained and Unrestrained Eaters." *Frontiers in Nutrition*, 7, 30. (What-the-hell effect)
- Stawarz, K., Cox, A. L., & Blandford, A. (2015). "Beyond Self-Tracking and Reminders." *CHI 2015*, 2653–2662.
- Locke, E. A. & Latham, G. P. (2002). "Building a practically useful theory of goal setting." *American Psychologist*, 57(9), 705–717.

---

## 8. Implementation Details

### 8.1 File Map

| File | Purpose |
|---|---|
| `src/db.ts` | Dexie database v2, TypeScript interfaces, `isDueToday()`, `weekDateKeys()`, `getWeekCompletionCount()`, `seedIfEmpty()` |
| `src/TodayView.tsx` | Greeting, warmth meter, habit cards with glow, ritual step expansion, xperweek weekly progress badge, `isDoneForToday()` for warmth bar |
| `src/HabitsView.tsx` | Habit list, inline edit form, emoji grid picker, frequency selector with xperweek stepper, delete modal overlay |
| `src/CalendarView.tsx` | Month grid, warmth heat map computation (`computeWarmth()`), month navigation, DayDetail integration |
| `src/DayDetail.tsx` | Bottom sheet overlay for tapping calendar days — view and retroactively toggle completions |
| `src/App.tsx` | App shell with 4-tab navigation, calls `seedIfEmpty()` on mount |
| `src/App.css` | All component styles — dark theme, glow effects, animations (warmPulse, just-completed, slideUp, fadeIn) |
| `src/index.css` | CSS variables (--bg-deep: #0d0d1a, --glow-warm: #ff8c42, etc.) and global resets |
| `src/main.tsx` | React root render + SW registration (path: `/glow/sw.js`) |
| `index.html` | PWA meta tags (apple-mobile-web-app-capable, theme-color, viewport-fit=cover), all href paths use `/glow/` base |
| `public/manifest.json` | PWA manifest (name: Glow, standalone, dark theme, start_url: `/glow/`) |
| `public/sw.js` | Service worker — network-first with cache fallback, versioned cache 'glow-v1' |
| `public/icon.svg` | App icon — radial gradient orange glow circle on dark background |
| `vite.config.ts` | Vite config with `base: '/glow/'` for GitHub Pages |
| `.github/workflows/deploy.yml` | GitHub Actions workflow: npm ci → npm run build → upload-pages-artifact → deploy-pages |
| `CONTEXT.md` | This file |

### 8.2 Key Implementation Patterns

**Warmth bar (TodayView):** `isDoneForToday()` checks if the habit has a completion for today. For xperweek habits, it counts as done for warmth if today has a completion — it doesn't wait for the weekly goal to be fully met. This means checking off a 3×/week habit contributes to today's warmth immediately.

**xperweek frequency:** Shows every day (isDueToday returns true). Card shows "2/3 this week" badge. Once weekly goal is met, treated as fully done. Uses `weekDateKeys()` + `getWeekCompletionCount()` to query completions for Sun–Sat of current week.

**Calendar warmth computation:** `computeWarmth(dateKey, date, habits, completionsByDate, ritualStepsMap)` returns 0–1 ratio. -1 means nothing was due that day. Rituals contribute step-level granularity (3/5 steps = 0.6 credit). Colors scale through transparent → cream → peach → amber → golden.

**Emoji picker:** Uses a tappable grid of 30 hardcoded emojis instead of a text input. This avoids the iOS keyboard sliding up and hiding form fields on Safari PWA.

**Inline edit:** When editing a habit, the edit form expands below that specific habit card (tracked via `editingId` state), rather than scrolling to a bottom form.

**Delete flow:** Delete button inside edit form → modal overlay with habit details (emoji, name, creation date, frequency) → "Keep" / "Delete Forever" buttons. Deletion removes the habit, all its completions, and all ritual steps.

**Biweekly scheduling:** Uses anchor date (habit.createdAt). Calculates weeks since anchor's week start. If (weeks % 2 === 0) and day-of-week matches, habit is due. This ensures consistent biweekly cadence regardless of when you check.

### 8.3 CSS Theme

Dark background (#0d0d1a) with warm amber/golden glow effects. Key variables:
- `--bg-deep: #0d0d1a` (main background)
- `--bg-card: #1a1a2e` (card surfaces)
- `--glow-warm: #ff8c42` (primary warm glow)
- `--glow-gold: #ffb347` (golden accents)
- `--text-primary: #e8e0d4` (warm white text)
- `--text-muted: #8a8078` (dimmed text)

### 8.4 PWA Configuration

- **Base path:** `/glow/` (required for GitHub Pages since it's at `charters.github.io/glow/`)
- **All asset paths in index.html, manifest.json, and main.tsx use `/glow/` prefix**
- Service worker registered at `/glow/sw.js`
- Manifest start_url: `/glow/`
- Icon src: `/glow/icon.svg`
- If ever moving to a root domain, change `base` in vite.config.ts to `/` and update all `/glow/` references back to `/`

---

## 9. Deployment

### 9.1 Current Setup
- **URL:** https://charters.github.io/glow/
- **Repo:** https://github.com/charters/glow (public)
- **Deploy mechanism:** GitHub Actions workflow (`.github/workflows/deploy.yml`) triggers on push to `main`
- **GitHub Pages source:** GitHub Actions (not "Deploy from branch")
- **Build:** `npm ci` → `npm run build` (tsc + vite build) → uploads `dist/` as pages artifact

### 9.2 Deploy Workflow
Push to main → GitHub Actions runs → builds → deploys to Pages. Automatic, no manual steps.

### 9.3 Local Dev
```bash
cd c:\Users\alcharte\Projects\glow
npm run dev -- --host    # accessible on local network for phone testing
```
Dev server typically at `http://192.168.0.161:5173` (or next available port).

### 9.4 iPhone Install
1. Open https://charters.github.io/glow/ in Safari
2. Tap Share → Add to Home Screen
3. App runs standalone (no Safari chrome)

---

## 10. Remaining Work

### Phase 4 Items
- **Reflect view:** Monthly summary with warm day count, warmth trends, strongest habits, ritual step insights
- **Export/import backup:** Critical before serious piloting — IndexedDB is local-only, Safari can evict storage. Recommended: JSON export from Habits or Reflect tab, import to restore
- **Polish:** Glow animations, transitions, subtle haptic-like feedback

### Known Considerations
- **Data is device-local only.** IndexedDB on iPhone Safari. No cloud sync. Phone is single source of truth.
- **Safari can evict IndexedDB** if device is low on storage and app hasn't been used in a while. Export/import feature mitigates this.
- **No multi-device sync.** Firefox on PC and Safari on iPhone are completely separate databases.
