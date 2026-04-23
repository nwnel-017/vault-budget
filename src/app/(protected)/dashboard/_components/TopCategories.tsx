"use client";

import { formatFunds } from "@/utils/funds";
import styles from "./TopCategories.module.css";

type TopCategoriesProps = {
  categories: {
    id: string;
    categoryName: string;
    totalSpent: number;
    goalAmount: number | null;
    goalDifference: number | null;
  }[];
};

export default function TopCategories({ categories }: TopCategoriesProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>Top Categories</h2>
      </div>
      <div className={styles.gridWrapper}>
        <div className={styles.gridHeader} role="row">
          <span>Category</span>
          <span>Total Spent</span>
        </div>
        <div className={styles.gridBody}>
          {categories.map((category) => (
            <div className={styles.gridRow} key={category.id} role="row">
              <div className={styles.categoryDetails}>
                <span>{category.categoryName}</span>
                {category.goalDifference !== null ? (
                  <span
                    className={`${styles.goalDifference} ${
                      category.goalDifference > 0
                        ? styles.belowGoal
                        : styles.aboveGoal
                    }`}
                  >
                    {`${category.goalDifference >= 0 ? "+" : "-"}${formatFunds(
                      Math.abs(category.goalDifference),
                    )} ${
                      category.goalDifference >= 0
                        ? "until you reach your goal"
                        : "spent over your goal"
                    }`}
                  </span>
                ) : null}
              </div>
              <span className={styles.amount}>
                {formatFunds(category.totalSpent)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
