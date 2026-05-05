"use client";

import { useEffect, useState } from "react";
import styles from "./SpendingGoal.module.css";
import ChangeSpendingGoal from "./ChangeSpendingGoal";
import TargetIcon from "@/components/ui/icons/TargetIcon";
import PencilIcon from "@/components/ui/icons/PencilIcon";
// TO DO - review
export default function SpendingGoal({
  currentGoal,
}: {
  currentGoal?: string | null;
}) {
  const [toggleChangeGoal, setToggleChangeGoal] = useState(false);
  const [amount, setAmount] = useState(currentGoal ?? "");

  useEffect(() => {
    setAmount(currentGoal ?? "");
  }, [currentGoal]);

  function closeChangeGoal() {
    setToggleChangeGoal(false);
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.containerContent}>
          <div className={styles.iconWrapper}>
            <TargetIcon />
          </div>
          <div className={styles.textWrap}>
            <div className={styles.label}>Total Monthly Savings Goal</div>
            <label className={styles.label} htmlFor="spendingGoalAmount">
              <h1>${amount}</h1>
            </label>
          </div>
        </div>
        <button
          className={styles.button}
          onClick={() => setToggleChangeGoal(true)}
        >
          <PencilIcon />
          Change Goal
        </button>
      </div>
      {toggleChangeGoal ? (
        <ChangeSpendingGoal onClose={closeChangeGoal} />
      ) : null}
    </section>
  );
}
