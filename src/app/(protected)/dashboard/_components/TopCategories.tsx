"use client";

import { formatFunds } from "@/utils/funds";
import styles from "./TopCategories.module.css";

type TopCategoriesProps = {
  categories: {
    id: string;
    categoryName: string;
    totalSpent: number;
  }[];
};

// TO DO - review html and css
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
              <span>{category.categoryName}</span>
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
