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
| Framework | React + Vite | Fast, modern, excellent PWA plugin support |
| Language | TypeScript | Type safety for data model |
| Storage | IndexedDB via Dexie.js | Persistent local storage, no server needed, offline-first |
| Styling | CSS (custom properties + gradients) | Full access to gradients, backdrop-filter, animations for glow aesthetic |
| PWA | vite-plugin-pwa | Auto-generates service worker + manifest |
| Deployment | Any static host (Vercel/Netlify) or localhost tunnel | User accesses via URL, adds to home screen |

### 4.3 Data Model

**Habit**
- id (auto-increment)
- name (string)
- type: "simple" | "ritual"
- cadence: "daily" | "specific_days" | "weekly" | "biweekly" | "monthly"
- specificDays?: number[] (0=Sun, 6=Sat — for "specific_days" cadence)
- category?: string (household, self-care, health, custom)
- triggerCue?: string (implementation intention — "When I...")
- sortOrder: number
- archived: boolean
- createdAt: Date

**RitualStep**
- id (auto-increment)
- habitId (foreign key → Habit)
- name (string)
- sortOrder: number

**Completion**
- id (auto-increment)
- habitId (foreign key → Habit)
- date (string, YYYY-MM-DD format)
- completed: boolean (for simple habits)
- completedSteps?: number[] (array of RitualStep ids, for rituals)
- createdAt: Date

### 4.4 Views

#### Today (Primary — 95% of usage)
- Shows only habits/rituals applicable to today (based on cadence)
- Single tap to complete simple habits
- Rituals expand to show steps; tap individual steps for partial credit
- Soft warmth indicator at top shows today's glow level building
- Completed items stay visible but settled/dimmed
- Tap again to undo

#### Calendar (Signature View)
- Month grid with warmth/glow per day cell
- Gradient: neutral → faint cream → peach → amber → bright golden
- Today is outlined
- Tap any day for detail popover (what was done, retroactive logging)
- Swipe/arrows to navigate months
- No streak counters anywhere

#### Habits (Setup — Infrequent Use)
- List of all habits/rituals grouped by category
- Tap to edit: name, cadence, category, trigger cue
- Tap ritual to edit steps, reorder, add/remove
- Add new habit/ritual
- Swipe to archive (not delete — history preserved)

#### Reflection (Optional Monthly Summary)
- Warm days count: "You had 19 warm days in March"
- Warmth trend sparkline month-over-month
- Strongest habits view
- Ritual step insights (which steps tend to get skipped)
- No scoring, no grades, no prominent percentages

#### Navigation
```
┌─────────────────────────────┐
│        Active View          │
│        (full screen)        │
├─────────────────────────────┤
│  Today  Calendar  Habits  ☽ │
└─────────────────────────────┘
```
Four tabs, no hamburger menus. ☽ = Reflection.

---

## 5. Build Phases

| Phase | Scope | Outcome |
|---|---|---|
| 1 | Vite + React scaffold, data model (Dexie/IndexedDB), service worker, PWA manifest, Today view with starter habits | Installable app on phone, can mark habits done |
| 2 | Calendar view with glow rendering, tap-day detail, retroactive logging | Core visual experience |
| 3 | Habits view — create, edit, set cadence, build rituals with steps | Full self-service, no hard-coded data |
| 4 | Reflection view, glow animations, dark mode, polish | Complete app |

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
