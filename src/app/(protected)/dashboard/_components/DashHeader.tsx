import { formatFunds } from "@/utils/funds";
import styles from "./DashHeader.module.css";

type TopCategory = {
  categoryName: string;
  amountSpent: number;
};

export default function DashHeader({
  totalSpent,
  totalEarned,
  topCategory,
}: {
  totalSpent: number;
  totalEarned: number;
  topCategory: TopCategory | null;
}) {
  return (
    <div className={styles.header}>
      <div
        className={styles.categoryBox}
      >{`Total earned: ${formatFunds(totalEarned)}`}</div>
      <div
        className={styles.categoryBox}
      >{`Total spent: ${formatFunds(totalSpent)}`}</div>
      <div
        className={styles.categoryBox}
      >{`Total Saved: ${formatFunds(totalEarned + totalSpent)}`}</div>
      <div className={styles.categoryBox}>
        {topCategory
          ? `Top category: ${topCategory.categoryName} (${formatFunds(topCategory.amountSpent)})`
          : "Top category: None"}
      </div>
    </div>
  );
}
