import styles from "../../page.module.css";
import { categories } from "./landing-content";

export default function ProductPreview() {
  return (
    <figure className={styles.productPreview} aria-label="Sample FlowVault dashboard showing total saved, total earned, total spent, category spending, and top categories">
      <div className={styles.previewGlow} aria-hidden="true" />
      <div className={styles.importChip}><span aria-hidden="true" />Dashboard preview</div>
      <div className={styles.dashboardCard}>
        <div className={styles.dashboardToolbar}>
          <div><span>Dashboard</span><strong>May 1–31</strong></div>
          <span className={styles.sampleBadge}>Sample data</span>
        </div>
        <div className={styles.dashboardSummaryGrid}>
          <div className={styles.dashboardMetric}>
            <span>Total Saved</span>
            <strong>$600.00</strong>
            <small>+$100 above goal</small>
            <svg viewBox="0 0 120 28" aria-hidden="true"><path d="M2 24 C18 20, 25 22, 36 15 S58 19, 72 10 S96 14, 118 3" /></svg>
          </div>
          <div className={styles.dashboardMetric}>
            <span>Total earned:</span>
            <strong className={styles.earned}><i aria-hidden="true">↑</i>$3,080.00</strong>
          </div>
          <div className={styles.dashboardMetric}>
            <span>Total spent:</span>
            <strong className={styles.spent}><i aria-hidden="true">↓</i>$2,480.00</strong>
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
              <div><strong>{category.name}</strong><small>{category.goal === "Monthly total" ? "No goal set" : `${category.goal} · on track`}</small></div>
              <strong>{category.amount}</strong>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
