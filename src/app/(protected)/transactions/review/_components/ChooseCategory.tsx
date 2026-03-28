"use client";

import styles from "./ChooseCategory.module.css";

type ChooseCategoryProps = {
  active: boolean;
  categories: {
    id: string;
    category_name: string;
  }[];
  addTransactionCategory: (categoryId: string) => void | Promise<void>;
  closeChooseCategory?: () => void;
};

// TO DO : review and refactor
export function ChooseCategory({
  active,
  categories,
  addTransactionCategory,
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

        <div className={styles.categoryGrid}>
          {categories.map((category) => {
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
          })}
        </div>
      </div>
    </div>
  );
}
