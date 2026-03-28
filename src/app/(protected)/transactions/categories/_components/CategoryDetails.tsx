"use client";

import styles from "../page.module.css";

type CategoryDetailsProps = {
  category: {
    id: string;
    category_name: string;
  };
  removeCategory: () => Promise<void>;
  closeDetails: () => void;
  isPending: boolean;
  errorMsg: string;
};

export default function CategoryDetails({
  category,
  removeCategory,
  closeDetails,
  isPending,
  errorMsg,
}: CategoryDetailsProps) {
  return (
    <div className={styles.overlay} onClick={closeDetails}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>{category.category_name}</h2>
          <button
            className={styles.closeButton}
            type="button"
            onClick={closeDetails}
          >
            Close
          </button>
        </div>
        <p className={styles.modalText}>
          Remove this category from your transaction categories list.
        </p>
        <button
          className={styles.deleteCategoryButton}
          type="button"
          disabled={isPending}
          onClick={removeCategory}
        >
          Delete Category
        </button>
        {errorMsg ? (
          <p className={styles.formMessage} role="alert">
            {errorMsg}
          </p>
        ) : null}
      </div>
    </div>
  );
}
