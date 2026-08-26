# FlowVault Landing Page Design Plan

Status: Agreed design plan (primary designer + UI critic)  
Scope: Landing page only  
Primary objective: Turn privacy-conscious people who want a practical budgeting workflow into signed-up users.

## Product Positioning

FlowVault is a privacy-first personal budgeting app for people who want useful spending insights without linking their bank account. Users import a CSV transaction export, review and categorize transactions, let FlowVault learn repeat categorization choices, see spending summaries, and set category and savings goals.

The landing page should lead with the product's most distinctive, supportable promise:

> A personal budgeting app that turns bank-exported CSV files into clear spending insights—without connecting your bank account.

This wording is more concrete than “budget safely.” It names the product category, the input, the outcome, and the privacy distinction without implying that data stays only on the user's device or making an unverified security claim.

### Priority audiences

1. Privacy-conscious budgeters who do not want to share bank credentials with another service.
2. Spreadsheet budgeters who want less manual categorization and clearer summaries.
3. People whose bank or credit union is poorly supported by account-linking services but can export transactions as CSV.

### Message hierarchy

1. No bank connection required.
2. Import transaction CSV files and understand spending quickly.
3. FlowVault learns categorization choices to reduce repeat work.
4. Track spending, category limits, and savings goals in one workflow.

“Privacy-first” should be the positioning phrase; “no bank connection required” should remain the precise proof. Do not use “secure,” “anonymous,” “local,” “encrypted,” or “never shares your data” unless implementation and policy evidence supports those claims.

## Current Landing Page Review

### What is working

- The page already identifies its best differentiator: users do not need to connect a bank account or share bank login credentials.
- The three-page narrative—introduction, benefits, workflow—creates a reasonable foundation for progressive explanation.
- Sign-up is offered in the hero and again near the end, so there is a conversion path at both high- and lower-intent moments.
- The language around learned categorization is valuable and appears consistent with the implemented rule-based workflow.
- The visual system is approachable: blue communicates trust, rounded panels feel friendly, and the layouts become two-column at desktop widths.
- Buttons become full-width on mobile, supporting comfortable touch targets.

### What is not working

#### Positioning and copy

- “Keep track of your spending, safely.” is broad and not defensible enough to be persuasive. “Safely” raises questions the page does not answer, while the concrete no-bank-link advantage appears only below it.
- “Track your spending, set goals, and set money habits” repeats “set” and “money habits” is unnatural. It does not mention CSV imports, transaction categorization, or spending insights.
- The copy repeatedly says budgeting is simple or useful without showing proof, an example outcome, or a real interface.
- “Learns your spending habits” overstates the feature and can sound invasive. The implementation appears to learn categorization choices; that narrower phrase is clearer and more trustworthy.
- “Keep your budget” and “automatically categorize future spreadsheets” are awkward or inaccurate descriptions. Users keep spending on track, and the app categorizes future transactions—not spreadsheets.
- There are visible copy-quality issues: an empty subtitle paragraph, a space before a comma, a missing period, repeated ideas, and inconsistent terminology.
- The final CTA does not reduce risk. It should tell users whether they can start free and whether a bank connection or card is required, but only after those commercial facts are confirmed.

#### Visual hierarchy and conversion

- The hero centers the logo and product name more strongly than the user's desired outcome. The main headline should own the first viewport.
- There is no persistent header with a login path. Returning users and high-intent prospects should not have to infer where to go.
- The hero contains no product preview. Abstract Lottie illustrations decorate the page but do not demonstrate the upload, categorization, dashboard, or goals experience.
- Each major section is forced toward a full viewport height, which makes the page feel sparse and slows scanning. Content-driven spacing would keep narrative momentum.
- The desktop hero panel is only `30dvw`, leaving a large first viewport with low information density and no visual product proof.
- Staggered feature cards add movement but weaken alignment and scanning. A consistent grid or compact proof strip would make comparisons faster.
- The page ends immediately after the third section, with no trust explanation, objection handling, FAQ, login link, or footer.
- Hover feedback relies on scaling and has no visible focus-state plan. Motion and focus treatments need accessible, predictable behavior.

#### SEO and information architecture

- The document metadata—“FlowVault” and “A budgeting app designed for privacy”—is too generic to target useful search intent.
- The H1 is only the brand name. It does not describe the product for either users or search engines.
- High-intent phrases such as “privacy-first budgeting app,” “budget without linking a bank account,” “CSV transaction import,” “expense tracker,” and “automatic transaction categorization” are absent or underused.
- There is little indexable depth: no FAQ, no explanation of supported workflow, and no clear distinction between category spending goals and savings goals.
- SEO wording must remain natural. Use one primary topic per section and close variants rather than repeating a keyword mechanically.

## Agreed Design Direction

Create a polished, product-led landing page that feels calm, credible, and specific. Retain FlowVault's blue palette and friendly rounded geometry, but shift from a sequence of isolated white cards to one coherent page with strong typographic hierarchy, real product imagery, restrained decorative motifs, and denser narrative flow.

### Visual concept: “Clarity without the connection”

- Use a soft off-white canvas with deep navy text, FlowVault blue as the primary action color, and a restrained teal/green accent for positive progress.
- Keep subtle financial doodles only as low-contrast framing at the page edges; do not place them behind body copy.
- Show an authentic dashboard composition in the hero: spending summary, category breakdown, and goal progress. Pair it with a small “CSV imported” or “No bank connection” status chip.
- Use real screenshots or faithful UI composites from the product. Do not use abstract illustrations as the primary evidence of functionality.
- Use one consistent card radius, border treatment, and shadow scale. Reserve strong elevation for the hero product preview.
- Use short entrance motion only where it explains the workflow, and honor `prefers-reduced-motion`.

## Recommended Page Structure and Copy

### 1. Header

- Left: FlowVault logo and wordmark linked to the top.
- Center/right on desktop: How it works, Features, Privacy, FAQ.
- Actions: “Log in” as a text/secondary action and “Start free” as the primary action.
- On mobile: compact logo, Log in, and Start free; optional menu only if all anchor links cannot fit accessibly.
- Keep the header visually light. Make it sticky only if it does not crowd small screens.

### 2. Hero

Eyebrow:

> Privacy-first personal budgeting

H1:

> See where your money goes—without linking your bank.

Supporting copy:

> Import a transaction CSV from your bank, organize spending with categories, and track goals in one clear personal budget.

Primary CTA:

> Start free

Secondary CTA:

> See how it works

Risk reducer below CTA:

> No bank login required.

If confirmed by the product owner, add “No credit card required” and the exact free-tier allowance. Do not infer either from implementation alone.

Hero visual: a desktop dashboard preview overlapping a smaller transaction-review card, with readable category labels and believable but fictional sample values. Include a compact three-item proof row: “CSV import,” “Reusable category rules,” and “Goal tracking.” Avoid “smart,” which adds little proof and can imply unspecified AI. On narrow screens, show one legible primary preview rather than shrinking the full layered composition; move the secondary card below or hide it only when it duplicates visible information.

### 3. Problem/differentiator strip

Heading:

> Budget without an always-on bank connection.

Body:

> FlowVault works with transaction files you export from your bank. You choose what to upload and when, then get the organization and insights of a budgeting app without a live bank connection.

Use a simple comparison with two columns:

| Typical linked budgeting app | FlowVault |
| --- | --- |
| Authorize an ongoing account connection | Upload a bank-exported CSV |
| Ongoing transaction syncing | You choose when to import |
| Connection availability varies by bank | Works from exported transaction data |

Avoid suggesting that linked apps necessarily receive or store a user's bank password; many use third-party connection providers. The credible distinction is ongoing account access versus user-initiated file imports. Also avoid claiming that uploading a CSV eliminates all privacy or security risk.

### 4. How it works

Heading:

> From transaction export to useful budget in three steps

1. **Upload your transactions** — Export a CSV from your bank and map the date, merchant, and amount columns.
2. **Review and categorize** — Organize expenses into your own categories. FlowVault remembers categorization choices to reduce repeat work on future imports.
3. **Track spending and goals** — See spending summaries, monitor top categories, and compare progress with category and savings goals.

Show one real product crop per step. On mobile, stack each crop directly after its explanation. On desktop, use a numbered vertical narrative or tabs only if all content remains accessible without interaction.

### 5. Outcome-led feature section

Heading:

> Less spreadsheet work. More useful spending context.

Use four cards with an interface detail or small data visualization in each:

- **Categorize faster over time** — Reuse learned category rules for similar future transactions.
- **See spending by date range** — Review totals and top spending categories for the period that matters.
- **Set category spending goals** — Give categories clear limits and compare actual spending with the plan.
- **Keep savings visible** — Set a savings goal and review average monthly savings across a selected range.

Avoid generic feature icons when a miniature product state can demonstrate the feature.

### 6. Privacy/trust section

Heading:

> Budgeting without a live bank connection

Explain only verifiable facts:

- Users import transaction exports rather than provide bank login credentials.
- Users control when they upload new transaction data.
- Explain account authentication and stored-data handling only after checking the actual privacy and security implementation.

Include a link to a privacy policy once one exists. This section should answer the predictable question: “If I upload a file, what happens to my data?” The launch version should not imply an answer the product has not documented.

### 7. Pricing or plan clarity

The repository indicates a free tier and premium subscription, but public terms should be confirmed before landing-page implementation. Once confirmed, show a compact plan section containing:

- Exact free transaction allowance and whether it is lifetime, monthly, or otherwise reset.
- Premium price and billing interval.
- Feature differences, cancellation terms, and whether a credit card is required at sign-up.

If those details are not ready, omit pricing rather than use vague “free” language; change the CTA to “Create an account” and state only verified conditions.

### 8. FAQ

Use concise, visible answers to high-intent objections:

- Do I need to connect my bank account?
- How do I import transactions into FlowVault?
- What CSV columns does FlowVault need?
- Will FlowVault categorize transactions automatically?
- Can I create my own spending categories and goals?
- What happens to the transaction data I upload?
- Is FlowVault free?

The data-handling and pricing answers must be approved before publication. FAQ copy may support structured data only when the same questions and answers are visibly present on the page.

Keep the first three answers expanded or use native, keyboard-operable disclosure controls. Core product and privacy facts must remain available in server-rendered HTML even if disclosures are collapsed visually. Do not make accordion interaction a prerequisite for understanding the product.

### 9. Final CTA and footer

Heading:

> Build a clearer budget without linking your bank.

Body:

> Import your transactions, organize spending, and keep your goals in view with FlowVault.

CTA: “Start free” if verified; otherwise “Create an account.” Repeat “No bank login required.”

Footer: logo, short positioning line, Log in, Sign up, Privacy, Terms, and support/contact link. Do not show dead links; create or omit destinations during implementation based on available routes.

## SEO Plan

### Search intent

Primary topic: privacy-first budgeting app without bank linking.  
Secondary topics: CSV transaction import, personal expense tracker, automatic transaction categorization, spending category goals, savings tracking.

Suggested metadata:

- Title: `FlowVault: Budgeting App Without Bank Linking`
- Description: `Import bank transaction CSV files, categorize expenses, track spending, and set savings goals with FlowVault—no bank account connection required.`

Suggested page semantics:

- One descriptive H1 in the hero; the brand remains in the logo, title metadata, and body copy.
- One H2 for each major question or benefit; H3s for steps, features, and FAQ questions.
- Server-render the core marketing content. The current landing page is a client component solely because of animation; restructure so decorative interactive media does not force all copy into a client boundary.
- Give product images descriptive filenames and concise alt text that states what the interface shows. Decorative artwork should use empty alt text.
- Add canonical and Open Graph metadata when the production domain and share image are confirmed.
- Consider `SoftwareApplication` structured data only with verified application category, operating system context, offers, and URL. Never invent ratings or reviews.
- Add `FAQPage` structured data only if it complies with current search-engine guidance and exactly matches visible content.
- Set page-specific metadata on the public home route rather than replacing authenticated-area defaults globally. The final canonical URL, social image, and robots behavior must be verified for the production environment.

Keyword usage should follow meaning, not density. The H1, introduction, workflow section, and one FAQ answer are sufficient places to express “without linking your bank”; use natural variants elsewhere.

## Responsive and Accessible Behavior

- Design mobile first with a single-column narrative; expand at `min-width: 768px` and `min-width: 1024px`.
- Use `rem`, `%`, `dvw`, and `dvh` for layout and type sizing; reserve fixed pixels for raster image dimensions where needed.
- Keep body text at a comfortable reading size and line length, with hero type using `clamp()`.
- Keep interactive targets comfortably sized and provide visible keyboard focus states distinct from hover states.
- Use semantic `<header>`, `<nav>`, `<main>`, `<section>`, and `<footer>` landmarks; include a keyboard-visible skip link when the persistent header is introduced.
- Ensure text and controls meet WCAG AA contrast against gradients and tinted surfaces.
- Do not communicate category or goal state through color alone; pair color with labels and values.
- Keep DOM order logical when desktop sections alternate image and text placement.
- Respect reduced-motion preferences and do not autoplay nonessential animation for those users.
- Avoid mandatory horizontal carousels and hidden tab content in the main product explanation.
- Do not rely on `100dvw` for full-width sections where it can introduce horizontal overflow; use container width and logical padding. Test at 320 CSS pixels and at 200% browser zoom.

## Conversion and Content Guardrails

- Repeat one primary CTA label consistently throughout the page.
- Give “Log in” clear but lower emphasis than the acquisition CTA.
- Use fictional sample financial data in product previews and label it as sample data if ambiguity is possible.
- Do not add testimonials, customer counts, ratings, badges, or bank logos without genuine permission and evidence.
- Do not claim AI or machine learning; describe the observable behavior as learned categorization rules unless implementation changes.
- Do not promise support for every CSV format. Say users can map required columns; publish exact requirements in the FAQ.
- Avoid urgency patterns, fake scarcity, preselected paid plans, or privacy theater.

## Implementation Sequence

1. Confirm the public free-tier terms, premium pricing, credit-card requirement, data-handling explanation, privacy/terms destinations, and support route.
2. Capture or compose accurate product visuals using sanitized sample data for the dashboard, transaction review, category goals, and CSV mapping experience. Define a text/CSS fallback before implementation so missing screenshots do not block the page or invite inaccurate mockups.
3. Rewrite the semantic page structure and metadata around the approved copy above.
4. Build the mobile-first visual system and sections, reusing the existing blue brand direction while replacing abstract primary illustrations with product proof.
5. Add responsive layouts at the project's required breakpoints, keyboard focus states, reduced-motion behavior, and meaningful image alternatives.
6. Validate copy against actual product behavior; then test keyboard navigation, screen-reader landmarks/headings, contrast, mobile overflow, loading behavior, and CTA destinations.
7. Review conversion signals after launch: hero CTA clicks, workflow-section reach, sign-up starts, sign-up completions, and FAQ engagement. Use privacy-conscious analytics only after product approval.

## Acceptance Criteria

- A new visitor can explain what FlowVault does, how data enters the product, and why it differs from linked-account budget apps after the first viewport.
- The H1 contains the user outcome and core differentiation, not only the brand name.
- The first viewport includes a clear CTA, login path, no-bank-link proof, and a recognizable product preview.
- The page accurately demonstrates CSV import, categorization rules, spending summaries, category goals, and savings tracking.
- Every privacy, security, pricing, and automation statement is verified against the product.
- The content follows a clear sequence: promise → differentiation → workflow → outcomes → trust/plan questions → final CTA.
- The landing page is fully usable with keyboard navigation, reduced motion, mobile zoom, and narrow screens.
- CTA labels and destinations are consistent, every in-page anchor lands below the header without obscuring its heading, and no primary conversion action depends on JavaScript.
- Product previews remain readable on mobile, use sanitized fictional data, reserve their rendered space to avoid layout shift, and have purposeful alt text (or empty alt text when the same information is adjacent).
- Metadata and visible copy describe a personal budgeting app without bank linking in natural, non-repetitive language.

## Open Decisions Requiring Product Confirmation

- Is “Start free” accurate, and does sign-up require a card?
- Is the default 300-transaction free-tier limit the intended public offer, and does that allowance ever reset?
- Is the current premium fallback price intended for public display?
- What exact statement can FlowVault make about storage, retention, deletion, encryption, subprocessors, and uploaded CSV files?
- Which CSV file types, encodings, date formats, and banks have been verified?
- Are Privacy, Terms, and support pages available before this landing page ships?
- Should the landing page speak to “budgeting,” “expense tracking,” or both as the lead category based on the desired customer?

## Review Log

- Round 1 — Primary designer: Audited the current landing page and product-facing repository, established the product positioning, drafted the copy architecture, visual direction, SEO plan, accessibility requirements, guardrails, and open product decisions.
- Round 2 — UI critic: Agreed with the product-led, privacy-first direction and revised trust-sensitive competitor language to focus on ongoing account access rather than bank passwords. Replaced vague “smart” language with observable category-rule behavior; made mobile product proof, FAQ disclosure behavior, route-specific metadata, semantic landmarks, overflow/zoom testing, screenshot fallbacks, anchor behavior, and layout-shift expectations implementation-ready. No unresolved design disagreement remains; pricing, data handling, legal routes, and exact import compatibility still require the product confirmations already listed above.
- Round 3 — Primary designer: Accepted the critic's revisions. The more precise ongoing-connection comparison improves credibility, and the added responsive, semantic, and testable acceptance criteria strengthen the plan without changing its core direction. Both reviewers agree on the final plan; the remaining questions are product confirmations, not design disagreements.
