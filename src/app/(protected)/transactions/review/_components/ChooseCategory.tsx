"use client";

import type { CategorySummary } from "@/types/category";
import styles from "./ChooseCategory.module.css";

type ChooseCategoryProps = {
  active: boolean;
  currentCategory: string | null;
  categories: CategorySummary[];
  addTransactionCategory: (categoryId: string) => void | Promise<void>;
  autoCategorizeSimilarTransactions: boolean;
  setAutoCategorizeSimilarTransactions: (shouldAutoCategorize: boolean) => void;
  removeTransactionCategory: () => void;
  closeChooseCategory?: () => void;
};

// TO DO : review and refactor
export function ChooseCategory({
  active,
  currentCategory,
  categories,
  addTransactionCategory,
  autoCategorizeSimilarTransactions,
  setAutoCategorizeSimilarTransactions,
  removeTransactionCategory,
  closeChooseCategory,
}: ChooseCategoryProps) {
  if (!active) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      onClick={() => {
        closeChooseCategory?.();
      }}
    >
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h1>Select a category</h1>
          {closeChooseCategory ? (
            <button
              className={styles.closeButton}
              type="button"
              onClick={closeChooseCategory}
            >
              Close
            </button>
          ) : null}
        </div>

        <label className={styles.checkboxRow}>
          <input
            checked={autoCategorizeSimilarTransactions}
            type="checkbox"
            onChange={(event) => {
              setAutoCategorizeSimilarTransactions(event.target.checked);
            }}
          />
          <span className={styles.checkboxLabel}>
            Automatically put similar transactions into this category in the
            future
          </span>
        </label>

        <div className={styles.categoryGrid}>
          {categories.length > 0 ? (
            categories.map((category) => {
              return (
                <button
                  className={styles.categoryBubble}
                  key={category.id}
                  type="button"
                  onClick={() => addTransactionCategory(category.id)}
                >
                  {category.category_name}
                </button>
              );
            })
          ) : (
            <div className={styles.noCategoriesMessage}>
              No categories added.
            </div>
          )}
        </div>
        {currentCategory ? (
          <button
            className={styles.removeCategoryButton}
            type="button"
            onClick={() => removeTransactionCategory()}
          >
            Remove the category for this transaction
          </button>
        ) : null}
      </div>
    </div>
  );
}
