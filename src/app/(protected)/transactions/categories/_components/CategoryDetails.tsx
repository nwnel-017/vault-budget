"use client";

import styles from "../page.module.css";

type CategoryDetailsProps = {
  category: {
    id: string;
    category_name: string;
  };
  removeCategory: () => Promise<void>;
  updateCategoryName: () => Promise<void>;
  closeDetails: () => void;
  editedCategoryName: string;
  setEditedCategoryName: (categoryName: string) => void;
  isPending: boolean;
  errorMsg: string;
};

export default function CategoryDetails({
  category,
  removeCategory,
  updateCategoryName,
  closeDetails,
  editedCategoryName,
  setEditedCategoryName,
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
        <label className={styles.formLabel} htmlFor="editCategoryName">
          Edit category name
        </label>
        <div className={styles.formRow}>
          <input
            className={styles.categoryInput}
            id="editCategoryName"
            name="editCategoryName"
            type="text"
            value={editedCategoryName}
            onChange={(event) => {
              setEditedCategoryName(event.target.value);
            }}
            disabled={isPending}
          />
          <button
            className={styles.submitCategoryButton}
            type="button"
            disabled={isPending}
            onClick={updateCategoryName}
          >
            Edit Category
          </button>
        </div>
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
