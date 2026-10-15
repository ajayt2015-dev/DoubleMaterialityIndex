# Product Spec — Double Materiality Assessment

**Version:** 1.0
**Date:** 15 October 2026
**Author:** Ajay
**Status:** Confirmed

---

## Section 1 — Tool Summary

**Tool name:** Double Materiality Assessment

**What it does:** A single public web page that plots The Corporate's 16 material ESG topics as coloured dots on an interactive double materiality matrix (Financial Materiality on the x-axis, Impact Materiality on the y-axis, both fixed 1–5), over a background divided into four materiality zones. Users can show or hide Environmental, Social and Governance topics with toggle buttons, and hover or tap any dot to see its details.

**Who uses it:** The Corporate's Double Materiality Working Group, the Executive Leadership Team, and any internal or external reader (investors, B2B OEM customers, auditors) who receives the Vercel link.

**Why it exists:** The Corporate has completed its inaugural Double Materiality Assessment — topics identified, stakeholder engagement completed (employees, suppliers, investors, customers at 25% each), thresholds approved, and final blended scores calculated. The one missing piece is the matrix itself: a clear, branded, shareable visual showing where each topic sits and which materiality classification it falls into.

**Build status:** First build — no prior version.

---

## Section 2 — Classification

### Data Model

**Decision:** D1

| Label | What it means | This tool? |
|-------|--------------|-----------|
| D1 — Hardcoded | All data is written into the code by the developer. Users cannot input anything that persists. The tool displays what the developer put in. | Yes |
| D2 — Session | Data enters the tool during use and disappears when the tab closes. No database. Covers both uploaded files and form inputs. | No |
| D3 — Persisted | Data is written to a database and survives after the session ends. Supabase is required. | No |

**Reason:** The 16 topic scores are final, signed-off figures supplied by the builder; they are written into the page and users only view and filter them.

**D3 is triggered if any of the following are true — check all that apply:**
- [ ] Data must be retrievable after the session ends
- [ ] Multiple sessions contribute to the same dataset
- [ ] An audit trail or history is needed
- [ ] Data submitted by one person must be visible to another
- [ ] Results must be accessible via a URL after the session ends
- [ ] Files uploaded by users must be stored and retrievable later

None apply.

---

### Access Model

**Decision:** A1

| Label | What it means | This tool? |
|-------|--------------|-----------|
| A1 — Public | Anyone with the URL can use it. No login, no account required. | Yes |
| A2 — Authentication | Users must log in. All logged-in users see the same thing and have the same permissions. | No |
| A3 — Authorization | Users must log in and have different roles. Different roles see different data or have different permissions. | No |

**Reason:** The builder confirmed that anyone with the Vercel link can open the chart; there are no accounts and no differing permissions.

> **Promotion rule:** Auth requires a database. If the access model is A2 or A3, the data model is D3 — even when all displayed content is fixed. D1/D2 combined with A2/A3 are not valid classifications; they resolve to D3.

---

### If Access Model is A2 — complete both questions

N/A — access model is A1.

---

### If Access Model is A3 — define all roles

N/A — access model is A1.

---

### Tier

**Tier:** 1

| Tier | D+A combination | Stack | Deployment |
|------|----------------|-------|------------|
| 1 | D1+A1 or D2+A1 | Static frontend only | **Vercel** (builder's choice — replaces the framework default of Netlify for this tool) |
| 2 | D3+A1 | Netlify + Supabase (no auth) | Netlify |
| 3 | D3+A2 or D3+A3 | Netlify + Supabase (auth + RLS) | Netlify |

> **Deployment deviation:** The builder chose Vercel as the hosting platform. Because this is a Tier 1 static page with no server functions, environment variables, or database, the change of host has no architectural impact. Every Netlify reference in the framework's default build steps is replaced by Vercel for this tool.

---

### Standalone or Stack

**This tool is:** Standalone — it does not share a database with any other tool.

---

## Section 3 — Arms

Arms are capabilities added to the tool. They do not change the tier.

> **Document search and AI knowledge bases are outside this framework version.** Not requested for this tool.

---

### AI API Arm

**Active:** No

---

### Export Arm

**Active:** No — downloading the chart as an image or PDF is explicitly out of scope (Section 12).

---

### Email Arm

**Active:** No

---

### Scheduled Automation Arm

**Active:** No

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | HTML/CSS/JS — single view, minimal interaction (three toggle buttons and a tooltip). No build step required. A charting library may be loaded from a CDN with a pinned exact version, or the chart may be drawn with hand-written SVG; Claude Code chooses, but the result must meet every requirement in Sections 8–10 and 13. Hand-written SVG is preferred for full control of zones, dot labels and collision handling. |
| Deployment target | Vercel (builder's choice) |
| Vercel MCP / connector | Not active — deployment is done manually by the builder: after Claude Code pushes to `main`, the builder imports the GitHub repo into Vercel via the Vercel dashboard ("Add New → Project → Import Git Repository"), framework preset "Other", no build command, output directory = repo root (or the folder Claude Code places `index.html` in — Claude Code must state this clearly in the README). Subsequent pushes to `main` redeploy automatically. |

**GitHub — pre-build requirement for all Tier 1, 2, and 3 tools:**
The user creates the GitHub repo before the first Claude Code session. The product-spec.md, CLAUDE.md, and PROGRESS.md must be uploaded to the repo root before Claude Code opens. Claude Code assumes the repo exists, commits changes regularly, and pushes to main. It does not create or configure the repo.

---

### CONDITIONAL: Supabase project — only complete if Tier 2 or Tier 3

N/A — Tier 1, no database.

---

### CONDITIONAL: Only complete if this tool is part of a stack

N/A — standalone tool.

---

## Section 5 — Data Architecture

### CONDITIONAL: Only complete if Data Model is D3

N/A — data model is D1. The full hardcoded dataset is specified in Section 9.

---

## Section 6 — Access and Permissions

### CONDITIONAL: Only complete if Access Model is A2 or A3

N/A — access model is A1 (public, no login).

---

## Section 7 — GDPR

### MANDATORY DECISION: Complete this section for every D3 tool.

N/A — this is a D1 tool. No data is collected, stored or submitted; the page displays aggregated topic scores only and contains no personal data.

---

## Section 8 — Screen and UI Structure

The tool is a single page with one view. It must be fully usable on desktop and on mobile (from 360 px wide), with no horizontal page scroll.

### Matrix Page (the only view)

- **Purpose:** Show where each of The Corporate's 16 material topics sits on the double materiality matrix and which classification zone it falls into.

- **What is visible (top to bottom):**

  1. **Header band**
     - Full-width black (`#000000`) band.
     - Left: the text logo **`[ C ] THE CORPORATE`** in off-white (`#F2F2F2`), Arial, bold, uppercase, letter-spaced (this is the logo exactly as it appears on The Corporate's documents — there is no image file; render it as text).
     - Title: **Double Materiality 2026** in Georgia, off-white, larger than the logo.
     - Optional small subtitle line in taupe (`#B6B09F`), Arial: "16 material topics · Financial vs Impact materiality".

  2. **Category filter bar** — three toggle buttons, in this order:
     - **E — Environmental** (green swatch)
     - **S — Social** (yellow swatch)
     - **G — Governance** (red swatch)
     - Each button shows its category colour swatch, its letter, its label, and the count of topics in the category (E 8, S 6, G 2).
     - All three start **ON**.
     - ON state: filled/solid styling with the category swatch at full colour.
     - OFF state: clearly different — e.g. outlined/hollow, swatch greyed out, reduced opacity, and the label text struck through or dimmed. The difference must be obvious at a glance, not colour-only.
     - Buttons must expose their state to assistive tech (`aria-pressed="true|false"`) and be keyboard operable (Tab + Enter/Space).

  3. **The matrix chart**
     - Square plot area.
     - **x-axis:** "Financial Materiality" — fixed range 1.0 to 5.0, tick labels at 1, 2, 3, 4, 5.
     - **y-axis:** "Impact Materiality" — fixed range 1.0 to 5.0, tick labels at 1, 2, 3, 4, 5.
     - Light gridlines at every whole number.
     - **Background zones** drawn behind the gridlines and dots, geometry exactly as defined in Section 9:
       - Highly Material — pale red tint
       - Material — pale orange tint
       - Watch List — light gray
       - Not Material — gray
     - Zone names may be printed faintly inside each zone area (e.g. small uppercase taupe/dark-gray text in a zone corner) so the chart reads even without the legend. Text must not collide with dots.
     - **16 dots**, one per topic, positioned at (financial_score, impact_score).
       - Fill colour by category (Section 10). Every dot has a dark outline (black or near-black, ~1.5 px) so it stands out from every zone tint, including red dots on the red zone and yellow dots on the orange zone.
       - The topic number **01–16** (two digits, leading zero) printed inside each dot, centred, with text colour chosen for contrast (white on green and red dots, black on yellow dots).
       - Dot size large enough to hold a two-digit number legibly (roughly 26–32 px diameter on desktop; may scale down slightly on mobile but the number must stay legible).
     - **Overlap handling (required):** several topics sit very close together (e.g. 01 GHG Emissions at 3.73/4.30 and 06 Upstream Supply Chain Emissions at 3.70/4.28 — under 5 px apart at typical sizes). Dots must never hide one another. Claude Code must apply a display-only nudge (collision avoidance) so every dot is fully visible and individually hoverable/tappable. When a dot is displaced from its true coordinate, draw a thin leader line from the dot to a small marker at its exact coordinate. The tooltip always reports the exact, un-nudged scores. Nudging is recalculated when filters change (only visible dots are considered) and on resize.

  4. **Legends** (below the chart on mobile; beside or below it on desktop)
     - **Zone legend:** four swatches with name and threshold rule:
       - Highly Material — ≥ 3.5 on both axes
       - Material — ≥ 3.0 on either axis
       - Watch List — an axis 2.0–2.9, neither ≥ 3.0
       - Not Material — both axes < 2.0
     - **Category legend:** E green / S yellow / G red (may be merged with the filter buttons if the buttons already serve as the legend — Claude Code's choice, as long as the colour-to-category mapping is unambiguous).

  5. **Footer** — small taupe line: "The Corporate | Double Materiality Assessment | Scores: blended stakeholder average (Employees, Suppliers, Investors, Customers — 25% each), 1.0–5.0 scale."

- **User actions:**
  - Click/tap **E**, **S** or **G** to toggle that category's dots off or on. Any combination is allowed, including all three off (in which case the chart shows the zones with no dots and a small centred message: "No categories selected — turn on E, S or G to show topics.").
  - **Hover** a dot (desktop) or **tap** a dot (mobile/touch) to open a tooltip showing:
    - Topic number and full topic name (e.g. "03 · Water Stewardship")
    - Category in full (Environmental / Social / Governance)
    - Financial score (2 decimals, e.g. 3.28)
    - Impact score (2 decimals, e.g. 3.78)
    - Zone (e.g. "Material"), with its zone colour swatch
  - Keyboard: dots are focusable (Tab) and the tooltip opens on focus; Escape closes it.
  - Tooltip stays within the viewport (flips side near edges). On touch, tapping elsewhere or tapping another dot closes/moves it.

- **What happens next:** Toggling a category immediately shows/hides its dots (a short fade, ≤ 200 ms, is fine; no layout shift). Nothing else changes on the page. There is no navigation, no saving, and no other view.

---

## Section 9 — Logic and Calculations

**What is calculated or scored:** Each topic's materiality classification (zone), derived from its two final blended scores using The Corporate's approved thresholds. The zones are also drawn as background areas of the chart.

**Inputs:** The hardcoded dataset below (source: `Materiality_Aggregated_Scores.xlsx`, sheet "Aggregated", supplied by the builder). Scores are already final blended values — the page does **not** recalculate them from stakeholder inputs.

| # | Topic name (exact) | Category | Financial score (x) | Impact score (y) | Expected zone |
|---|-------------------|----------|--------------------|-----------------|---------------|
| 01 | GHG Emissions (Scopes 1, 2, 3) | E | 3.73 | 4.30 | Highly Material |
| 02 | Energy Management & Renewable Transition | E | 3.58 | 3.80 | Highly Material |
| 03 | Water Stewardship | E | 3.28 | 3.78 | Material |
| 04 | Hazardous Materials & Chemical Management | E | 4.03 | 4.33 | Highly Material |
| 05 | Waste Generation & Circular Economy | E | 3.43 | 3.88 | Material |
| 06 | Upstream Supply Chain Emissions (Scope 3 Cat. 1) | E | 3.70 | 4.28 | Highly Material |
| 07 | Air Quality & Process Emissions | E | 3.18 | 3.55 | Material |
| 08 | Product End-of-Life & E-Waste | E | 3.48 | 4.13 | Material |
| 09 | Occupational Health & Safety | S | 3.95 | 4.20 | Highly Material |
| 10 | Labor Rights & Working Conditions | S | 4.43 | 4.58 | Highly Material |
| 11 | Responsible Minerals Sourcing | S | 4.13 | 4.55 | Highly Material |
| 12 | Community Impact & Local Employment | S | 3.13 | 3.70 | Material |
| 13 | Workforce Development & Skills | S | 3.63 | 3.35 | Material |
| 14 | Diversity, Equity & Inclusion | S | 3.20 | 3.43 | Material |
| 15 | ESG Governance & Board Accountability | G | 3.70 | 3.48 | Material |
| 16 | Multi-Jurisdictional Regulatory Compliance & Ethics | G | 4.33 | 4.05 | Highly Material |

Totals: 8 Highly Material, 8 Material, 0 Watch List, 0 Not Material. The "Expected zone" column is for verification only — the page must **compute** the zone from the scores, not read it from this column.

Category codes map to full names: E = Environmental, S = Social, G = Governance.

**Formula or rules:** (from the approved Stakeholder Engagement Strategy, 2 April 2026 — "Materiality Threshold Definitions"). Classifications are evaluated **top-down; the first match applies** (priority rule: the highest matching classification always applies; a strong score on one axis cannot be overridden by a weak score on the other).

Let `f` = financial score, `i` = impact score.

1. **Highly Material** — `f >= 3.5 AND i >= 3.5`
2. **Material** — `f >= 3.0 OR i >= 3.0` (and not Highly Material)
3. **Watch List** — `f >= 2.0 OR i >= 2.0` (and neither axis ≥ 3.0)
4. **Not Material** — `f < 2.0 AND i < 2.0`

Note: the source document describes the Watch List band as "2.0–2.9". Any value from 2.0 up to but not including 3.0 (e.g. 2.95) is treated as Watch List — there is no gap between 2.9 and 3.0.

Worked example from the source document (use as a test): `f = 3.3, i = 2.5` → **Material**.

**Background zone geometry** (on the fixed 1–5 × 1–5 plot area; this is the visual expression of the rules above, so a dot's colour zone always matches its tooltip zone):

- **Highly Material:** the square from x = 3.5 to 5, y = 3.5 to 5 (top-right).
- **Material:** every point where x ≥ 3.0 or y ≥ 3.0, excluding the Highly Material square — an L-shaped band wrapping the left and bottom of the Highly Material square and extending to the top and right edges of the chart.
- **Watch List:** the square from x = 1 to 3, y = 1 to 3, excluding the Not Material square — an L-shaped band.
- **Not Material:** the square from x = 1 to 2, y = 1 to 2 (bottom-left).

Boundary lines at exactly 2.0, 3.0 and 3.5 belong to the higher zone (≥ comparisons).

**Output:** For each topic, one zone label (Highly Material / Material / Watch List / Not Material), shown in the tooltip. The four background zones are drawn regardless of whether any dot falls in them.

**Edge cases:**
- Scores are fixed and validated at build time: every score must be a number between 1.0 and 5.0 inclusive. Claude Code adds a small self-check in the code (or a test) that asserts all 16 topics are present, scores are in range, and the computed zones equal the "Expected zone" column above.
- Watch List and Not Material zones are empty with the current data — this is correct and expected; they must still be drawn and shown in the legend.
- All categories toggled off → empty-state message (Section 8).
- Near-identical coordinates → collision nudge with leader lines (Section 8); tooltip shows exact scores.

---

## Section 10 — Brand and Visual Direction

**Brand reference:** No brand file — The Corporate's brand is derived from its official documents (ESG Material Topics and Stakeholder Engagement Strategy) and confirmed by the builder as the brand to follow.

- **Primary colour:** Black `#000000` (header band, primary text, dot outlines)
- **Secondary colours:** Off-white `#F2F2F2` (page background, text on black), warm beige `#EAE4D5` (panels/cards, e.g. the area around the chart and legends), taupe `#B6B09F` (secondary text, subtitles, footer, subtle rules)
- **Font:** Georgia (serif) for the title and headings; Arial (sans-serif) for everything else — buttons, axis labels, tick labels, dot numbers, tooltips, legends. Use system font stacks (`Georgia, "Times New Roman", serif` and `Arial, Helvetica, sans-serif`); no web-font download is needed.
- **Logo:** Text-only logo `[ C ] THE CORPORATE` — no image file exists; render as styled text.

**Chart colours (confirmed with the builder):**

| Element | Colour | Suggested value |
|--------|--------|-----------------|
| E dots | Green | `#2E8B57` (white number) |
| S dots | Yellow | `#F2C200` (black number) |
| G dots | Red | `#C62828` (white number) |
| Dot outline | Black / near-black | `#111111`, ~1.5 px |
| Highly Material zone | Pale red tint | `#F6CFCB` |
| Material zone | Pale orange tint | `#FBE0BD` |
| Watch List zone | Light gray | `#E8E8E8` |
| Not Material zone | Gray | `#C4C4C4` |

The builder confirmed that zones are **pale tints** and dots are **full-strength colours with a dark outline**, so red G dots remain visible on the red Highly Material zone and yellow S dots remain visible on the orange Material zone. Suggested hex values may be adjusted slightly by Claude Code for contrast, but the four zones must remain clearly distinguishable from one another and recognisable as red / orange / light gray / gray.

**Visual feel:** Professional and corporate — clean, restrained, editorial (matching the black-and-beige document style), with the chart as the focal point.

**Reference or inspiration:** The Corporate's own documents: black header blocks with off-white text, beige table fills, taupe accents, Georgia headlines over Arial body text.

---

## Section 11 — API and Credentials

| Service | What it does in this tool | Key required | Where key is stored |
|---------|--------------------------|-------------|-------------------|
| Vercel | Hosts the static page | None (builder's own Vercel account; no keys in the project) | N/A |
| GitHub | Source repository connected to Vercel | None in the project | N/A |

> **Security rule — no exceptions:** No API key, token, password, or credential may appear in any HTML file, any JavaScript file, or any file committed to GitHub. This tool needs no credentials at all.

**Credentials readiness:**

| Credential | Status | Where to get it |
|-----------|--------|----------------|
| None required | N/A | N/A |

The builder needs a Vercel account (free Hobby plan is sufficient for a static page) to import the GitHub repo.

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| Table/list view of all 16 topics below the chart | Not needed to validate the matrix; confirmed out of scope by the builder |
| Download chart as PNG image or PDF (Export arm) | Not needed for first build; confirmed out of scope |
| Editing scores or uploading new data in the page | Scores are final and signed off; page is display-only (D1) |
| Filtering by materiality zone | Only E/S/G filtering requested |
| Per-stakeholder-group score breakdown (Employees / Suppliers / Investors / Customers) | Only final blended scores are in scope; would require additional data |
| Login / restricted access | Builder confirmed the link is public |

---

## Section 13 — Acceptance Criteria

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Page loads | Header shows `[ C ] THE CORPORATE` text logo and the title "Double Materiality 2026" on a black band; brand colours and Georgia/Arial fonts applied per Section 10 | [ ] |
| 2 | Axes | x-axis labelled "Financial Materiality", y-axis "Impact Materiality", both fixed 1–5 with ticks at every whole number; ranges do not change when filters change | [ ] |
| 3 | Background zones | Four zones drawn with exact geometry from Section 9 (Highly Material square 3.5–5 × 3.5–5; Material L-band; Watch List L-band within 1–3; Not Material square 1–2 × 1–2), coloured pale red / pale orange / light gray / gray, all clearly distinguishable | [ ] |
| 4 | Dots plotted | Exactly 16 dots at the coordinates in Section 9, each showing its two-digit number 01–16, coloured E green / S yellow / G red with dark outline; all legible on every zone tint | [ ] |
| 5 | Zone classification | Computed zones match the "Expected zone" column (8 Highly Material, 8 Material); the worked example f=3.3, i=2.5 classifies as Material; a value of 2.95 classifies as Watch List | [ ] |
| 6 | Overlap handling | No dot hides another; 01 and 06 (and 04/09, 02/05) are each individually visible and hoverable; displaced dots show a leader line to their exact coordinate | [ ] |
| 7 | E/S/G toggles | Each button hides/shows only its category's dots; all start ON; OFF state is obviously different (not colour-only); `aria-pressed` reflects state; keyboard operable | [ ] |
| 8 | All filters off | Zones remain; empty-state message is shown | [ ] |
| 9 | Tooltip | Hover (desktop), tap (touch) and keyboard focus each show number + full name, category in full, financial score and impact score to 2 decimals (exact, not nudged), and zone with swatch; stays inside viewport; closes on Escape / tap elsewhere | [ ] |
| 10 | Legends and footer | Zone legend with four swatches and threshold rules; category mapping unambiguous; footer methodology line present | [ ] |
| 11 | Responsive | Works on desktop and on a 360 px-wide phone with no horizontal scroll; chart stays square and dot numbers stay legible | [ ] |
| 12 | Data self-check | Code contains a check that all 16 topics exist, scores are within 1.0–5.0, and computed zones match Section 9 | [ ] |
| 13 | No credentials | No keys, tokens or secrets anywhere in the repo | [ ] |
| 14 | Deployment | Page is live at the Vercel URL after the builder imports the repo; loads correctly on desktop and mobile | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 1

---

### Pre-build steps — complete these before opening Claude Code

- [ ] Tool Architect skill — interview complete, this spec is written and confirmed by the builder
- [ ] Project Governor skill — CLAUDE.md and PROGRESS.md produced from this spec
- [ ] GitHub repo created by the builder
- [ ] product-spec.md uploaded to the GitHub repo root
- [ ] CLAUDE.md uploaded to the GitHub repo root
- [ ] PROGRESS.md uploaded to the GitHub repo root
- [ ] Brand skill file uploaded to the GitHub repo root — N/A (brand defined in Section 10)
- [ ] Vercel account available to the builder (repo is imported into Vercel after the build — see below)
- [ ] All credentials identified — N/A, none required

> Claude Code organizes these files into the correct folder structure (docs/, .claude/skills/) automatically at the start of the first session.

---

### Tier 1 — build session

- [ ] Open Claude Code in the project folder (GitHub repo)
- [ ] Claude Code runs First Session Setup: creates docs/, moves reference files
- [ ] Claude Code reads product-spec.md, CLAUDE.md, and PROGRESS.md
- [ ] Claude Code builds the tool (static `index.html` + CSS + JS, no build step)
- [ ] Test locally before deploying (open in a browser at desktop and 360 px widths; run the data self-check)
- [ ] Claude Code pushes to `main` and writes a short README section "Deploying to Vercel" stating the output directory
- [ ] **Vercel MCP not active (manual deploy):** builder imports the GitHub repo in the Vercel dashboard → framework preset "Other", no build command, output directory as stated in the README → Deploy. Future pushes to `main` redeploy automatically. No environment variables needed.

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| Source documents call this the "2025 assessment" while the page title is "Double Materiality 2026". Builder has chosen "Double Materiality 2026" for the header; confirm no other on-page text should reference 2025. | Builder | No — can resolve during build |
| Exact tint hex values for the four zones and dot colours may be fine-tuned for contrast during build. | Claude Code (builder approves visually) | No |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | 15 October 2026 | Initial build |

---

*This spec is written for Claude Code. It assumes zero prior context. Every decision, rule, and requirement must be explicit enough that the builder can hand this document to Claude Code without a single verbal explanation.*
