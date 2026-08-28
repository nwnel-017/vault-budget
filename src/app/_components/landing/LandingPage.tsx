import Link from "next/link";
import { AppLogo } from "@/components/ui/icons/AppLogo";
import { APP_NAME } from "@/lib/general/app-name";
import styles from "../../page.module.css";
import ProductPreview from "./ProductPreview";
import { categories, faqs, features, transactions, workflowSteps } from "./landing-content";

function WorkflowPreview({ preview }: { preview: (typeof workflowSteps)[number]["preview"] }) {
  if (preview === "mapping") {
    return <div className={styles.workflowPreview}><div className={styles.previewBar}><span>Bank export.csv</span><strong>3 columns mapped</strong></div>{[["Date purchased", "Transaction Date"], ["Merchant", "Description"], ["Amount", "Debit / Credit"]].map(([field, column]) => <div className={styles.mappingRow} key={field}><span>{field}</span><strong>{column}</strong><em>Mapped</em></div>)}</div>;
  }
  if (preview === "review") {
    return <div className={styles.workflowPreview}><div className={styles.previewBar}><span>Review transactions</span><strong>Rule saved</strong></div>{transactions.map((item) => <div className={styles.reviewRow} key={item.merchant}><div><strong>{item.merchant}</strong><span>{item.amount}</span></div><em>{item.category}</em></div>)}</div>;
  }
  return <div className={styles.workflowPreview}><div className={styles.previewBar}><span>Goal progress</span><strong>May 1–31</strong></div>{categories.slice(0, 3).map((item) => <div className={styles.goalRow} key={item.name}><div><strong>{item.name}</strong><span>{item.amount} · {item.goal}</span></div><div className={styles.progressTrack}><span style={{ width: `${item.progress}%` }} /></div></div>)}<div className={styles.savingsStrip}><span>Savings goal</span><strong>$600 of $1,000</strong></div></div>;
}

export default function LandingPage() {
  return (
    <div className={styles.landingPage}>
      <a className={styles.skipLink} href="#main-content">Skip to main content</a>
      <header className={styles.header}>
        <nav className={`${styles.container} ${styles.nav}`} aria-label="Primary navigation">
          <Link href="/" className={styles.brand} aria-label={`${APP_NAME} home`}><span className={styles.logo}><AppLogo /></span><span>{APP_NAME}</span></Link>
          <div className={styles.anchorNav}><Link href="#how-it-works">How it works</Link><Link href="#features">Features</Link><Link href="#privacy">Privacy</Link><Link href="#faq">FAQ</Link></div>
          <div className={styles.accountNav}><Link href="/login" className={styles.loginLink}>Log in</Link><Link href="/signup" className={styles.smallCta}>Create an account</Link></div>
        </nav>
      </header>

      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Privacy-first personal budgeting</p>
              <h1 id="hero-title">See where your money goes—without linking your bank.</h1>
              <p className={styles.heroBody}>Import a transaction CSV from your bank, organize spending with categories, and track goals in one clear personal budget.</p>
              <div className={styles.heroActions}><Link href="/signup" className={styles.primaryCta}>Create an account <span aria-hidden="true">→</span></Link><Link href="#how-it-works" className={styles.secondaryCta}>See how it works</Link></div>
              <p className={styles.riskReducer}><span aria-hidden="true">✓</span> No bank login required.</p>
            </div>
            <ProductPreview />
            <ul className={styles.proofRow} aria-label="FlowVault highlights"><li><span aria-hidden="true">↥</span>CSV transaction import</li><li><span aria-hidden="true">↻</span>Reusable category rules</li><li><span aria-hidden="true">◎</span>Goal tracking</li></ul>
          </div>
        </section>

        <section className={`${styles.section} ${styles.comparisonSection}`} aria-labelledby="comparison-title">
          <div className={styles.container}>
            <div className={styles.sectionIntro}><p className={styles.eyebrow}>A different way to budget</p><h2 id="comparison-title">Budget without an always-on bank connection.</h2><p>FlowVault works with supported transaction files you export from your bank. You choose what to upload and when, then get the organization and insights of a budgeting app without a live bank connection.</p></div>
            <div className={styles.comparisonGrid}>
              <article className={styles.comparisonCard}><p className={styles.comparisonLabel}>Typical linked budgeting app</p><ul><li>Authorize an ongoing account connection</li><li>Transactions sync on the service&apos;s schedule</li><li>Connection availability can vary by bank</li></ul></article>
              <article className={`${styles.comparisonCard} ${styles.flowVaultCard}`}><p className={styles.comparisonLabel}>{APP_NAME}</p><ul><li>Upload a supported bank-exported CSV</li><li>You choose when to import transactions</li><li>No live bank connection is required</li></ul></article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.workflowSection}`} id="how-it-works" aria-labelledby="workflow-title">
          <div className={styles.container}>
            <div className={styles.sectionIntro}><p className={styles.eyebrow}>How {APP_NAME} works</p><h2 id="workflow-title">From transaction export to useful budget in three steps</h2><p>Bring the transaction data you already have, organize it once, and turn it into a budget you can keep using.</p></div>
            <div className={styles.steps}>{workflowSteps.map((step, index) => <article className={`${styles.step} ${index % 2 === 1 ? styles.stepReverse : ""}`} key={step.number}><div className={styles.stepCopy}><span>{step.number}</span><h3>{step.title}</h3><p>{step.description}</p></div><div className={styles.previewShell}><WorkflowPreview preview={step.preview} /></div></article>)}</div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.featuresSection}`} id="features" aria-labelledby="features-title">
          <div className={styles.container}>
            <div className={styles.sectionIntro}><p className={styles.eyebrow}>Built for follow-through</p><h2 id="features-title">Less spreadsheet work. More useful spending context.</h2><p>FlowVault turns a manual transaction export into a repeatable view of where your money is going and what you want it to do next.</p></div>
            <div className={styles.featureGrid}>{features.map((feature) => <article className={styles.featureCard} key={feature.title}><span className={styles.featureMarker}>{feature.marker}</span><h3>{feature.title}</h3><p>{feature.description}</p><div className={styles.featureProof}>{feature.proof}</div></article>)}</div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.privacySection}`} id="privacy" aria-labelledby="privacy-title">
          <div className={`${styles.container} ${styles.privacyPanel}`}><div><p className={styles.darkEyebrow}>Privacy by workflow</p><h2 id="privacy-title">Budgeting without a live bank connection</h2><p>You bring the transaction exports you choose, on your schedule. FlowVault gives you a budgeting workflow without asking you to authorize ongoing access to a bank account.</p></div><ul><li><span aria-hidden="true">01</span><div><strong>Import instead of connect</strong><p>Use a supported transaction export rather than a live bank feed.</p></div></li><li><span aria-hidden="true">02</span><div><strong>You choose when to upload</strong><p>Add new transaction data when you are ready to review it.</p></div></li></ul></div>
        </section>

        <section className={`${styles.section} ${styles.faqSection}`} id="faq" aria-labelledby="faq-title">
          <div className={`${styles.container} ${styles.faqContainer}`}><div className={styles.sectionIntro}><p className={styles.eyebrow}>Questions, answered</p><h2 id="faq-title">Know what to expect before you begin.</h2><p>The essentials of importing transactions and building your FlowVault budget.</p></div><div className={styles.faqList}>{faqs.map((faq, index) => <details className={styles.faqItem} key={faq.question} open={index === 0}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></div>
        </section>

        <section className={styles.finalSection} aria-labelledby="final-cta-title"><div className={`${styles.container} ${styles.finalCta}`}><p className={styles.darkEyebrow}>Start with the data you already have</p><h2 id="final-cta-title">Build a clearer budget without linking your bank.</h2><p>Import your transactions, organize spending, and keep your goals in view with {APP_NAME}.</p><Link href="/signup" className={styles.lightCta}>Create an account <span aria-hidden="true">→</span></Link><span className={styles.finalNote}>No bank login required.</span></div></section>
      </main>

      <footer className={styles.footer}><div className={`${styles.container} ${styles.footerInner}`}><div className={styles.footerBrand}><Link href="/" className={styles.brand}><span className={styles.logo}><AppLogo /></span><span>{APP_NAME}</span></Link><p>Personal budgeting from the transaction files you choose to import.</p></div><div className={styles.footerLinks}><div><strong>Product</strong><Link href="#how-it-works">How it works</Link><Link href="#features">Features</Link><Link href="#privacy">Privacy</Link></div><div><strong>Account</strong><Link href="/login">Log in</Link><Link href="/signup">Create an account</Link></div></div></div></footer>
    </div>
  );
}
