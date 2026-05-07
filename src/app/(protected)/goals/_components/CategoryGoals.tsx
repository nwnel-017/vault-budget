"use client";

import { useState, useTransition } from "react";
import styles from "./CategoryGoals.module.css";
import ChangeCategoryGoal from "./ChangeCategoryGoal";
import { changeCategoryGoal as updateCategoryGoal } from "../actions";

type CategoryGoalsProps = {
  categories: {
    id: string;
    category_name: string;
    spending_goal: string | null;
  }[];
};

function formatSpendingGoal(spendingGoal: string | null) {
  if (!spendingGoal) {
    return "No goal set";
  }

  const goalAmount = Number(spendingGoal);

  if (Number.isNaN(goalAmount)) {
    return "No goal set";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(goalAmount);
}

export default function CategoryGoals({ categories }: CategoryGoalsProps) {
  const [changeGoals, setChangeGoals] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    category_name: string;
    spending_goal: string | null;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function openGoalEditor(category: {
    id: string;
    category_name: string;
    spending_goal: string | null;
  }) {
    setErrorMsg("");
    setSelectedCategory(category);
    setChangeGoals(true);
  }

  function closeGoalEditor() {
    setErrorMsg("");
    setChangeGoals(false);
    setSelectedCategory(null);
  }

  async function submitCategoryGoal(amount: string) {
    amount = amount.trim();
    if (!selectedCategory) {
      return;
    }

    const response = await updateCategoryGoal(selectedCategory.id, amount);

    if (!response.success) {
      setErrorMsg(response.error ?? "Unable to update goal.");
      return;
    }

    closeGoalEditor();
  }

  return (
    <div>
      <ChangeCategoryGoal
        active={changeGoals && !!selectedCategory}
        categoryName={selectedCategory?.category_name ?? ""}
        currentGoal={selectedCategory?.spending_goal ?? ""}
        isPending={isPending}
        errorMsg={errorMsg}
        closeChangeGoal={closeGoalEditor}
        changeCategoryGoal={(amount) => {
          startTransition(() => {
            void submitCategoryGoal(amount);
          });
        }}
      />
      <section className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Category Spending Goals</h1>
          <p className={styles.description}>
            Review each category&apos;s monthly spending target.
          </p>
        </div>

        <div className={styles.grid}>
          {categories.length > 0 ? (
            categories.map((category) => {
              return (
                <article className={styles.card} key={category.id}>
                  <div className={styles.content}>
                    <h2 className={styles.categoryName}>
                      {category.category_name}
                    </h2>
                    <p className={styles.goalText}>
                      {formatSpendingGoal(category.spending_goal)}
                    </p>
                  </div>
                  <button
                    className={styles.goalButton}
                    type="button"
                    onClick={() => openGoalEditor(category)}
                  >
                    Change goal
                  </button>
                </article>
              );
            })
          ) : (
            <>
              <p>
                No categories found. Please visit the categories page to add
                your spending categories.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
