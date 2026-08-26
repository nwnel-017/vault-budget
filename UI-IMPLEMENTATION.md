# FlowVault Landing Page UI Implementation Plan

Status: Agreed implementation plan (primary designer + senior UI reviewer)  
Source of truth: `UI-DESIGN.md`  
Scope: Public landing page at `/` only  
Goal: Give an implementation agent enough structure, content, responsive behavior, and acceptance criteria to build the agreed design without inventing product claims or redesigning protected application screens.

## 1. Implementation Outcome

Replace the current three-screen, animation-led landing page with one cohesive, product-led marketing page. The first viewport must explain that FlowVault is a personal budgeting app that imports bank-exported CSV files and does not require a live bank connection. The page should then show the workflow, demonstrate real product outcomes, answer trust questions, and repeat one clear account-creation action.

The finished page should feel calm, credible, and practical rather than futuristic or sales-heavy. Preserve the recognizable FlowVault blue and rounded visual language while improving hierarchy, density, proof, and accessibility.

## 2. Non-Negotiable Constraints

- Follow the repository's `AGENTS.md`: Next.js components use `.tsx`, component styling uses CSS Modules, layout is mobile first, and media queries use `min-width: 768px` and `min-width: 1024px`.
- Read the relevant installed Next.js guides immediately before implementation, especially server/client components, metadata, images, CSS, and `Link`.
- Keep `src/app/page.tsx` a Server Component. It must continue checking the session and redirecting authenticated users to `/dashboard`.
- Render the marketing copy as Server Components. Do not keep the entire landing page behind the current `"use client"` boundary merely to support animation.
- Do not add dependencies for icons, animation, layout, or accordions.
- Do not change the protected product UI as part of the landing-page work.
- Do not claim encryption, anonymity, local-only processing, universal bank compatibility, AI, machine learning, or data practices that have not been verified.
- Do not publish invented testimonials, usage counts, ratings, endorsements, bank logos, or press badges.
- Do not expose real financial data in screenshots or UI previews.

## 3. Decisions Required Before Coding

Resolve these content decisions before implementation begins when the product owner is available. Record approved answers in the implementation task or product copy; do not infer them from environment fallbacks. If answers remain unavailable, proceed with the safe fallbacks in this table so every conditional section has a deterministic outcome.

| Decision | Why it matters | Safe fallback if unresolved |
| --- | --- | --- |
| Is account creation free, and is a card required? | Controls every primary CTA and risk reducer. | Use “Create an account”; do not say “free” or “no card required.” |
| Is the 300-transaction free-tier limit public, and does it reset? | Determines whether a pricing/plan section can be accurate. | Omit plan quantities and pricing. |
| What is the approved premium price and billing interval? | Repository fallback values are not public-policy confirmation. | Omit the pricing section. |
| What can be said about uploaded-file processing, data storage, retention, deletion, and security? | Required for credible privacy and FAQ answers. | State only that users import exports instead of connecting a bank account and choose when to upload. |
| Which CSV formats and column requirements are supported? | Controls workflow and FAQ specificity. | State only the verified date, merchant, and amount mapping workflow. |
| Do Privacy, Terms, and support routes exist? | Controls footer content. | Omit unavailable links; never render dead destinations. |

The layout must not be blocked by unresolved pricing or legal routes. Those sections have explicit omission states below.

## 4. Proposed File and Component Map

Inspect the final repository structure before adding anything and match nearby naming. The preferred structure is:

```text
src/app/
├── page.tsx                         # Session redirect + route metadata + landing composition
├── page.module.css                  # Landing root, tokens, container, shared section primitives
└── _components/
    └── landing/
        ├── LandingPage.tsx
        ├── LandingHeader.tsx
        ├── HeroSection.tsx
        ├── ProductPreview.tsx
        ├── ProductPreview.module.css
        ├── ComparisonSection.tsx
        ├── WorkflowSection.tsx
        ├── WorkflowSection.module.css
        ├── FeatureSection.tsx
        ├── PrivacySection.tsx
        ├── PlanSection.tsx           # Add only when public plan details are approved
        ├── FaqSection.tsx
        ├── FinalCta.tsx
        ├── LandingFooter.tsx
        └── landing-content.ts        # Static typed copy/data; no JSX and no client directive
```

This is a target, not permission to add every file mechanically. Start with one route stylesheet for tokens, containers, typography, header, simple sections, CTA, FAQ, and footer. Give a component its own CSS Module only when it owns a complex visual system, such as the product preview or workflow previews. If a section has only a small amount of unique markup, combine it with a neighboring component to avoid trivial components. Keep major page sections separate enough to scan and maintain. Every created component must have a clear responsibility.

All files in this map are Server Components by default. Do not add `"use client"` to `LandingPage` or any section. The proposed anchors and native `<details>` FAQ require no client boundary. If a later approved requirement introduces browser state, isolate only that smallest interactive leaf as a Client Component.

### Existing file treatment

- `src/app/page.tsx`: retain auth/session behavior; add static route metadata here because metadata exports require a Server Component.
- `src/app/LandingPage.tsx`: relocate it into the landing component folder and update the import in `page.tsx`, or rewrite it in place if moving adds no organizational value. Do not leave both old and new implementations. The final landing composition must not be a Client Component.
- `src/app/page.module.css`: replace obsolete landing rules or narrow this file to the route shell. Do not leave unused `.intro`, `.ctas`, animation, or full-viewport section rules after the rewrite.
- `src/app/globals.css`: do not put section-specific landing styles here. Limit changes to genuinely global tokens or document behavior that both public and protected layouts can safely share. Prefer landing-level custom properties to avoid accidentally restyling authenticated screens.
- Existing Lottie JSON and package: the new page should not import the abstract animations. Do not delete assets or remove the dependency unless separately requested.
- Existing `AppLogo`: reuse it if its rendered size, contrast, and accessible labeling work in the new header/footer. Otherwise adapt usage locally; do not redesign the application-wide logo in this task.

## 5. Page-Level Architecture

Recommended semantic tree:

```text
body
└── route shell
    ├── a.skipLink → #main-content
    ├── header
    │   └── nav[aria-label="Primary navigation"]
    ├── main#main-content
    │   ├── section.hero[aria-labelledby="hero-title"]
    │   ├── section.comparison[aria-labelledby="comparison-title"]
    │   ├── section.workflow#how-it-works[aria-labelledby="workflow-title"]
    │   ├── section.features#features[aria-labelledby="features-title"]
    │   ├── section.privacy#privacy[aria-labelledby="privacy-title"]
    │   ├── section.plan             # conditional
    │   ├── section.faq#faq[aria-labelledby="faq-title"]
    │   └── section.finalCta[aria-labelledby="final-cta-title"]
    └── footer
```

Use one `<h1>` in the hero. Each major section gets an `<h2>`. Card and step titles use `<h3>` only when they introduce nested content. Do not use heading elements merely to enlarge text.

### Container system

- Full-width sections own their background color or gradient.
- Each section contains an inner `.container` capped at approximately `76rem` with responsive inline padding.
- Use a narrower reading measure of roughly `38rem`–`44rem` for explanatory text.
- Use `clamp()` for major typography and section spacing.
- Avoid `width: 100dvw`; use `width: 100%` so scrollbars do not create horizontal overflow.
- Do not force marketing sections to `100dvh`. Use content-driven block padding, with only the hero allowed a reasonable minimum height after accounting for the header.
- Give anchored sections `scroll-margin-block-start` even with a non-sticky header so focus and future sticky behavior remain predictable.

### Landing-only visual tokens

Define tokens on the landing root so protected screens remain unaffected:

- Canvas: warm off-white.
- Surface: white.
- Primary text: deep navy with high contrast.
- Secondary text: muted slate, not opacity on inherited text.
- Brand action: existing FlowVault blue, adjusted only if contrast testing requires it.
- Positive/progress accent: restrained teal or green.
- Border: cool low-contrast blue-gray.
- Radius scale: small control radius, medium card radius, large showcase radius.
- Shadow scale: subtle card shadow and one stronger preview shadow.
- Content width, reading width, and section spacing variables.

Use explicit color values in the CSS Module or landing root variables. Avoid global semantic token changes until their effect on authenticated pages is checked.

## 6. Responsive Layout Summary

| Area | Base/mobile | `min-width: 768px` | `min-width: 1024px` |
| --- | --- | --- | --- |
| Header | Logo, Log in, primary CTA; hide anchor nav | Add more breathing room; anchor nav may remain hidden | Show anchor nav between brand and actions |
| Hero | Copy then one legible product preview | Wider CTA row and preview | Two-column copy/preview layout, approximately 45%/55% |
| Proof row | Three stacked or wrapped items | Three equal columns | Three compact inline items beneath hero copy/visual |
| Comparison | Stacked cards; avoid a squeezed table | Two labeled columns | Two-column comparison in one shared surface |
| Workflow | Step copy followed by its preview | Alternating rows allowed | Three balanced step rows or a stable two-column narrative |
| Features | One card per row | Two-column grid | Four cards in a two-by-two grid; do not create four cramped columns |
| Privacy | One column | One column with wider inset panel | Two-column statement + fact list |
| FAQ | One column | One column with capped width | One column; readability over unused width |
| Final CTA | Centered stack, full-width button if needed | Inline CTA sizing | Wide contained banner |
| Footer | Stacked groups | Two columns | Brand + link groups in one row |

The 320 CSS pixel layout must remain usable without horizontal scrolling. At 200% browser zoom, content must reflow and no navigation or CTA may be clipped.

## 7. Section-by-Section Build Specification

### A. Header

#### Content

- Brand link: logo plus “FlowVault,” linking to `/`.
- Desktop anchors: “How it works” → `#how-it-works`, “Features” → `#features`, “Privacy” → `#privacy`, “FAQ” → `#faq`.
- Secondary route action: “Log in” → `/login`.
- Primary route action: approved global CTA → `/signup`.

#### Layout and behavior

- Use a compact horizontal bar within the shared container.
- Prefer non-sticky for the first implementation. Sticky behavior is optional only after confirming it does not obscure anchor headings or reduce the mobile viewport excessively.
- Do not introduce a hamburger menu merely to preserve anchor links. Hide the optional anchor set on narrow screens while retaining Log in and the acquisition CTA.
- If sticky is implemented, give target sections `scroll-margin-block-start` equal to the header clearance.
- Brand link needs an accessible name if the logo SVG itself is decorative.
- Provide visible `:focus-visible` outlines for all links.

### B. Hero

#### Copy

- Eyebrow: “Privacy-first personal budgeting”
- H1: “See where your money goes—without linking your bank.”
- Body: “Import a transaction CSV from your bank, organize spending with categories, and track goals in one clear personal budget.”
- Primary CTA: “Start free” only if verified; otherwise “Create an account.”
- Secondary CTA: “See how it works” → `#how-it-works`.
- Risk reducer: “No bank login required.” Add “No credit card required” only if approved.

#### Layout

- Mobile DOM order: copy → CTA group → risk reducer → preview → proof row.
- Desktop: copy left and preview right, vertically centered. Keep the H1 around 10–14 words per visual line depending on viewport.
- Primary CTA is filled blue; secondary CTA is a bordered/text treatment. They must not look equally primary.
- Use a light radial or mesh-like CSS background behind the preview, not behind the H1 body copy.
- Do not place the full wordmark above the H1; the header already establishes the brand.

#### Product preview

Preferred implementation is a faithful HTML/CSS composite built from sanitized sample data. This avoids depending on unavailable production screenshots and keeps labels readable. It must represent existing product capabilities, not propose a redesigned application UI.

Primary dashboard card:

- Header label such as “This month.”
- Use the frozen sample dataset below; do not add an “earned” metric unless inspection confirms that the product dashboard currently calculates and presents it.
- A simple category list or CSS bars for Groceries, Housing, Transport, and Dining.
- A labeled goal-progress element that does not rely on color alone.

Secondary transaction card on desktop/tablet:

- Two or three example merchant rows.
- Category labels such as Groceries and Transport.
- A small “Category rule applied” status.

Status chip:

- “CSV imported” or “No live bank connection.”

On mobile, show only the dashboard card and one compact status chip. Move or omit the overlapping transaction card so it does not shrink text below legibility. Mark the whole composite `aria-hidden="true"` only if adjacent prose fully conveys the same information; otherwise provide one concise accessible label at the figure level and hide internal decorative repetition.

Freeze one fictional dataset in `landing-content.ts` and reuse it in every preview:

| Datum | Value |
| --- | --- |
| Date range | May 1–31 |
| Total spending | $2,480 |
| Groceries | $420 of $500 goal |
| Housing | $1,250 |
| Transport | $185 of $250 goal |
| Dining | $210 of $300 goal |
| Savings progress | $600 of $1,000 goal |
| Sample transactions | Fresh Market −$64.20; Metro Transit −$28.00; Corner Cafe −$18.40 |

Treat these as illustrative UI data, not customer results. Keep number formatting consistent and do not introduce percentage values that disagree with the amounts. Product previews should use normal document layout rather than scaling a desktop mockup with `transform`, because transformed text becomes illegible and can distort the accessible layout.

Proof items below the hero:

- CSV import
- Reusable category rules
- Goal tracking

Use existing local SVG icons only when semantically suitable. Otherwise create minimal CSS shapes or text-first items; do not add a third-party icon library.

### C. Comparison section

#### Copy

- H2: “Budget without an always-on bank connection.”
- Supporting paragraph from `UI-DESIGN.md`.

#### Layout

- On mobile, render two separately labeled cards rather than a four-column semantic table that would become unreadable.
- On tablet/desktop, use one shared comparison surface with two column headings and three aligned rows.
- Each FlowVault row can use a restrained check marker; the competitor column must remain neutral, not alarmist or visually punished.
- Keep the defensible distinction: ongoing authorized account connection versus user-initiated transaction-file uploads. Do not mention competitors receiving passwords. Change “Works from exported transaction data” to “Uses supported CSV transaction exports” unless actual import compatibility has been verified; this avoids implying that every bank export works unchanged.

### D. Workflow section

#### Content

Use the three approved steps:

1. Upload and map date, merchant, and amount columns.
2. Review transactions, assign categories, and reuse learned category choices.
3. Review summaries and track category and savings goals.

#### Layout

- Each step is an `<article>` with a visible two-digit number (`01`, `02`, `03`), H3, short paragraph, and preview.
- Mobile: stack text then preview for every step.
- Desktop: alternate visual position by CSS Grid placement while preserving text-first DOM order for every article.
- Use consistent preview aspect ratios and surface treatments.
- Do not use tabs, a carousel, autoplay, or scroll-triggered client logic.
- At desktop, each article uses a two-column grid with a bounded text column and a wider preview column. Alternate with named grid areas or explicit classes, never `direction: rtl`, so text direction and keyboard/reading order stay intact.

#### Step previews

- Step 1: CSV column-mapping mini-grid with headers for Date, Merchant, and Amount.
- Step 2: transaction-review list with category selections and a “Rule saved” indicator.
- Step 3: spending summary with category-goal and savings-goal progress.

Build these as HTML/CSS composites unless approved sanitized screenshots are supplied. Keep sample values consistent across all previews so they feel like one coherent sample account.

### E. Outcome-led feature section

#### Content

Four cards:

1. Categorize faster over time.
2. See spending by date range.
3. Set category spending goals.
4. Keep savings visible.

Use the descriptions from `UI-DESIGN.md` with only fact-checking edits.

#### Layout

- Place the eyebrow, H2, and introduction above a one-column/two-column card grid.
- Every card contains a text block and one small UI proof element: rule badge, date-range selector, category progress bar, or savings statistic.
- Keep all cards visually equal without forcing equal text heights through fixed block sizes.
- Use borders and gentle tint changes more than heavy shadows.

### F. Privacy/trust section

#### Content

- H2: “Budgeting without a live bank connection.”
- Lead statement explaining that the user exports and uploads transaction data on their schedule.
- Verified fact list:
  - Import transaction exports instead of authorizing a live bank connection.
  - Choose when to upload new transaction data.
  - Add approved storage/deletion facts only after product confirmation.

#### Layout

- Use a visually distinct blue/navy inset panel with sufficiently high-contrast white or near-white text.
- Left side: heading and concise explanation.
- Right side: two or three fact rows with plain-language labels.
- Do not use a lock icon as the only proof of trust.
- If a real Privacy route exists, add one contextual link; otherwise omit it.

### G. Optional plan section

Render this section only when the public free and premium terms are confirmed.

- Use at most two plan cards: Free and Premium.
- State exact allowance, billing interval, and feature differences.
- Do not preselect Premium or style Free as a decoy.
- Use the same approved primary CTA language and route.
- If terms are incomplete, omit the whole section. Do not leave “Coming soon,” placeholder prices, or ambiguous plan language.

### H. FAQ

#### Content

Include only questions with approved, useful answers. Prioritize:

1. Do I need to connect my bank account?
2. How do I import transactions?
3. Which columns does my CSV need?
4. How does automatic categorization work?
5. Can I create categories and goals?
6. What happens to uploaded transaction data?
7. Is FlowVault free?

Questions 6 and 7 must be omitted until their answers are approved.

#### Interaction

- Preferred implementation: native `<details>` and `<summary>` elements, which work without custom client JavaScript and retain keyboard semantics.
- Keep the first item open by default. Do not force only one item to remain open.
- Style the native marker intentionally or supplement it with a decorative CSS indicator while retaining an obvious expanded/collapsed state.
- Answers must be present in server-rendered HTML.
- Structured data is out of scope unless the visible final answers have been approved and current search guidance is rechecked.

### I. Final CTA

- H2: “Build a clearer budget without linking your bank.”
- Body: approved sentence from `UI-DESIGN.md`.
- One primary CTA to `/signup`.
- Risk reducer: “No bank login required.”
- Use a contained brand-color banner with subtle background decoration, not another full viewport.
- Do not repeat a secondary Learn More link here; the visitor has reached the end of the narrative.

### J. Footer

- Brand group: logo, FlowVault, and one-sentence positioning line.
- Product links: How it works, Features, Privacy section.
- Account links: Log in and Sign up.
- Legal/support links only when valid routes exist.
- Add a current-year copyright line only if desired; it is lower priority than functional destinations.
- Mobile: stack groups with clear spacing. Desktop: distribute brand and link groups horizontally.

## 8. Content Data Model

Keep repeated content in `landing-content.ts` as readonly arrays so mapping stays typed and markup remains readable. Suggested shapes:

```ts
type AnchorItem = {
  label: string;
  href: `#${string}`;
};

type WorkflowStep = {
  number: string;
  title: string;
  description: string;
  preview: "mapping" | "review" | "summary";
};

type FeatureItem = {
  title: string;
  description: string;
  proof: "rule" | "range" | "categoryGoal" | "savings";
};

type FaqItem = {
  question: string;
  answer: string;
};

type PreviewData = {
  range: string;
  totalSpending: string;
  categories: readonly {
    name: string;
    amount: string;
    goal?: string;
  }[];
  savings: { amount: string; goal: string };
  transactions: readonly {
    merchant: string;
    amount: string;
    category: string;
  }[];
};
```

Do not over-generalize every section into a universal card component. The shared content types should reduce repetition without obscuring section-specific semantics or layout.

## 9. Metadata and Search Implementation

Because `src/app/page.tsx` must remain a Server Component, export static route metadata there:

- Title: `FlowVault: Budgeting App Without Bank Linking`
- Description: `Import bank transaction CSV files, categorize expenses, track spending, and set savings goals with FlowVault—no bank account connection required.`

Also plan for:

- Canonical URL after the production domain is confirmed.
- Open Graph title, description, URL, type, and a purpose-built share image after an asset is approved.
- Twitter card metadata that reuses the approved share image.
- No rating, review, or pricing structured data without verified public values.
- No FAQ structured data during the first implementation unless current guidance is checked and final visible answers are approved.

Do not move generic marketing metadata into `src/app/layout.tsx`, because that layout also wraps authenticated routes. Keep route-specific SEO on the public home page.

## 10. Asset Strategy

Preferred order:

1. HTML/CSS product composites using sanitized fictional data.
2. Approved, sanitized local screenshots captured at high resolution.
3. Simple existing local SVG assets when semantically appropriate.

If raster screenshots are used:

- Place them under a clearly named landing asset directory inside `public` or use static imports in the matched project structure.
- Render through `next/image` with intrinsic dimensions or a stable aspect-ratio container to prevent layout shift.
- Set accurate `sizes` values for mobile and desktop layouts.
- Load the hero image eagerly only if it is the likely largest-contentful element; lazy-load below-the-fold screenshots.
- Use short alt text that describes the visible product state and outcome. Use empty alt text when adjacent content fully duplicates the image.

Never fabricate a capability in a screenshot. Use one consistent fictional dataset and avoid real institution names or logos.

## 11. Interaction and Motion

- Primary conversion and route navigation use Next.js `Link`.
- In-page anchors must work without JavaScript.
- FAQ uses native disclosures; no custom accordion state is needed.
- Do not reintroduce autoplay Lottie animation.
- CSS hover effects should change color, border, or elevation subtly; avoid scale effects that move nearby content.
- All hover affordances need equivalent `:focus-visible` treatment.
- If any optional reveal animation is added later, content must be visible by default, animation must not block interaction, and `prefers-reduced-motion: reduce` must disable it.

## 12. Accessibility Requirements

- Include a skip link as the first focusable element.
- Use exactly one H1 and a logical H2/H3 hierarchy.
- Give the primary navigation an accessible label.
- Use meaningful link text; avoid repeated context-free “Learn more.”
- Ensure all text and interactive states meet WCAG AA contrast.
- Use explicit secondary text colors, not opacity that can unpredictably reduce contrast.
- Ensure links and buttons have comfortable touch targets without using fixed pixel sizing in CSS.
- Product preview charts pair color with labels and numeric values.
- Decorative icons and shapes are hidden from assistive technology.
- Do not place meaningful copy only inside an image.
- Preserve logical DOM order when alternating desktop workflow rows.
- Verify native FAQ summaries expose expanded/collapsed state and remain usable from the keyboard.
- Test at 320 CSS pixels, 200% zoom, increased text size, reduced motion, keyboard-only navigation, and a screen-reader landmark/heading pass.

## 13. Performance Requirements

- Keep the page primarily server-rendered and ship no landing-specific client bundle unless an approved interaction genuinely needs one.
- Remove landing imports of `lottie-react` and large animation JSON from the route bundle; do not uninstall packages in this task.
- Prefer CSS gradients and shapes over large decorative raster backgrounds.
- If the existing tiled doodle background remains, reduce its visual and transfer cost impact or scope it to the landing root. Confirm it does not compromise text contrast.
- Reserve product-preview dimensions to avoid cumulative layout shift.
- Avoid rendering multiple oversized screenshots when smaller HTML/CSS previews communicate the same feature.
- Confirm the hero remains visually complete while below-the-fold assets load.

## 14. Implementation Order

1. Resolve the decision table and freeze the public claims/CTA label.
2. Inspect the current page, protected feature screens, existing icon components, and installed Next.js docs again immediately before coding.
3. Create the landing component directory in the established app structure and define typed static content.
4. Convert the landing composition to Server Components while preserving the authenticated redirect in `page.tsx`.
5. Build the landing-only token/container foundation and header/hero first.
6. Build the HTML/CSS hero product preview with one consistent sanitized sample dataset.
7. Add comparison, workflow, features, privacy, conditional plan, FAQ, final CTA, and footer in narrative order.
8. Add page-specific metadata and approved image metadata.
9. Remove unused landing imports/styles from replaced files without deleting unrelated assets or dependencies.
10. Perform responsive and accessibility validation; correct overflow, focus, contrast, heading, and preview-legibility issues.
11. Run only approved project scripts: `npm run lint` and `npm run build`. If failures are unrelated, report them without changing unrelated code.
12. Compare the result against the acceptance checklist and the approved claims before handoff.

If step 1 cannot obtain product-owner answers, explicitly select every safe fallback in Section 3 and continue. Do not leave conditional copy decisions for the coding agent to rediscover halfway through the build.

## 15. Agent Verification Checklist

### Content and conversion

- [ ] First viewport says what FlowVault is, how transactions enter it, and that no live bank connection is required.
- [ ] Header contains working Log in and account-creation paths.
- [ ] One approved primary CTA label is used consistently.
- [ ] Product previews demonstrate implemented capabilities with fictional data.
- [ ] No unapproved privacy, security, compatibility, pricing, or automation claim appears.
- [ ] No dead legal, support, or navigation link is rendered.

### Layout and responsiveness

- [ ] Mobile is one clear column with no tiny overlapping preview cards.
- [ ] Tablet uses the `768px` breakpoint and desktop uses `1024px`.
- [ ] Shared containers align section headings, content, and cards.
- [ ] No section uses `100dvw` or unnecessary full-viewport height.
- [ ] No horizontal scrolling occurs at 320 CSS pixels or 200% zoom.
- [ ] Product-preview text remains readable at every supported width.

### Semantics and accessibility

- [ ] Skip link, landmarks, single H1, and heading order are correct.
- [ ] All controls and links work by keyboard with visible focus.
- [ ] FAQ works without client JavaScript.
- [ ] Color is not the only carrier of chart or goal meaning.
- [ ] Decorative elements are ignored by assistive technology.
- [ ] Reduced-motion users receive no nonessential animation.

### Next.js and performance

- [ ] `page.tsx` remains a Server Component with the existing session redirect.
- [ ] Marketing content is server-rendered.
- [ ] Route-specific metadata is exported from the public page.
- [ ] Images use `next/image` and stable dimensions when raster assets are present.
- [ ] Lottie and animation JSON are absent from the landing route bundle.
- [ ] `npm run lint` passes or unrelated failures are documented.
- [ ] `npm run build` passes or unrelated failures are documented.

## 16. Definition of Done

The landing page is implementation-complete when a new visitor can understand the product and its no-live-bank-connection distinction in the first viewport; follow the CSV import-to-budget workflow through product evidence; find trustworthy answers without inflated claims; navigate to sign up or log in; and use the entire page on mobile, keyboard, zoomed, and reduced-motion configurations. The implementation must remain isolated from protected application UI and conform to the current installed Next.js behavior and repository conventions.

## Review Log

- Round 1 — Primary implementation designer: Converted the agreed design strategy into a component/file map, semantic page tree, breakpoint matrix, section specifications, content fallbacks, Server Component architecture, asset strategy, implementation order, and executable verification checklist.
- Round 2 — Senior UI implementation reviewer: Agreed with the overall product-led direction and made the execution path deterministic. Consolidated the excessive CSS Module proposal, made Server Component boundaries explicit, froze one internally consistent fictional preview dataset, prevented unsupported income and universal CSV-compatibility claims, clarified accessible desktop alternation, and required unresolved product decisions to use the documented fallbacks. No unresolved design disagreement remains; the revised plan is ready for implementation.
- Round 3 — Primary implementation designer: Accepted the review revisions. The consolidated styling structure is easier to execute, the fixed sample dataset prevents visual inconsistencies, and the explicit fallbacks allow implementation without inventing product policy. Both reviewers agree that the plan is implementation-ready.
