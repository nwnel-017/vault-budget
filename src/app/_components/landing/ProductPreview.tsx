import styles from "../../page.module.css";
import { categories } from "./landing-content";

export default function ProductPreview() {
  return (
    <figure className={styles.productPreview} aria-label="Sample FlowVault dashboard showing total saved, total earned, total spent, category spending, and top categories">
      <div className={styles.previewGlow} aria-hidden="true" />
      <div className={styles.importChip}><span aria-hidden="true" />Dashboard preview</div>
      <div className={styles.dashboardCard}>
        <div className={styles.dashboardToolbar}>
          <span aria-hidden="true">‹</span>
          <strong>May 1–31</strong>
          <span aria-hidden="true">›</span>
        </div>
        <div className={styles.dashboardSummaryGrid}>
          <div className={`${styles.dashboardMetric} ${styles.savedMetric}`}>
            <div className={styles.savedDetail}><div><span>Total Saved</span><strong>$600.00</strong></div><small>+$100.00 above goal</small></div>
            <svg viewBox="0 0 120 28" aria-hidden="true"><path className={styles.savingsArea} d="M2 24 C18 20,25 22,36 15 S58 19,72 10 S96 14,118 3 L118 28 L2 28 Z" /><path d="M2 24 C18 20,25 22,36 15 S58 19,72 10 S96 14,118 3" /></svg>
          </div>
          <div className={styles.dashboardMetric}>
            <span>Total earned:</span>
            <strong className={styles.earned}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 19h18a1.002 1.002 0 0 0 .823-1.569l-9-13c-.373-.539-1.271-.539-1.645 0l-9 13A.999.999 0 0 0 3 19z" /></svg>$3,080.00</strong>
          </div>
          <div className={styles.dashboardMetric}>
            <span>Total spent:</span>
            <strong className={styles.spent}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.178 19.569a.998.998 0 0 0 1.644 0l9-13A.999.999 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569l9 13z" /></svg>-$2,480.00</strong>
          </div>
          <div className={styles.dashboardMetric}>
            <span>Category Spending</span>
            <div className={styles.categoryChart} aria-label="Category spending chart"><span /></div>
          </div>
        </div>
        <div className={styles.topCategoriesCard}>
          <h3>Top Categories</h3>
          <div className={styles.topCategoriesHeader}><span>Category</span><span>Total Spent</span></div>
          {categories.slice(0, 3).map((category) => (
            <div className={styles.topCategoryRow} key={category.name}>
              <div><strong>{category.name}</strong>{category.goalStatus ? <small>{category.goalStatus}</small> : null}</div>
              <strong>{category.amount}</strong>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
