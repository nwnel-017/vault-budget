"use client";

import { useState } from "react";
import CategoryDetails from "./CategoryDetails";
import { createCategory, deleteCategory } from "../actions";
import styles from "../page.module.css";

type CategoryGridProps = {
  categories: {
    id: string;
    category_name: string;
  }[];
};

// TO DO: review this component
// TO DO: possibly move this to a components folder?
export default function CategoryGrid({ categories }: CategoryGridProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [category, setCategory] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    category_name: string;
  } | null>(null);

  async function submit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!category.trim()) {
      setErrorMsg("No category entered");
      return;
    }

    setErrorMsg("");
    setIsPending(true);

    try {
      const response = await createCategory(category);

      if (!response.success) {
        setErrorMsg(response.error ?? "Unable to create category.");
        return;
      }

      setCategory("");
      setIsFormOpen(false);
    } finally {
      setIsPending(false);
    }
  }

  async function removeCategory() {
    if (!selectedCategory) {
      return;
    }

    setErrorMsg("");
    setIsPending(true);

    const response = await deleteCategory(selectedCategory.id);

    if (!response.success) {
      setErrorMsg(response.error ?? "Unable to delete category.");
      return;
    }

    setSelectedCategory(null);
    setIsPending(false);
  }

  return (
    <>
      <div className={styles.header}>
        <h1>My Spending Categories</h1>
        <button
          className={styles.addCategoryButton}
          type="button"
          onClick={() => setIsFormOpen((current) => !current)}
        >
          Add Category
        </button>
      </div>

      {isFormOpen ? (
        <form onSubmit={(e) => submit(e)} className={styles.categoryForm}>
          <label className={styles.formLabel}>Category Name</label>
          <div className={styles.formRow}>
            <input
              className={styles.categoryInput}
              id="categoryName"
              name="categoryName"
              placeholder="Enter category name"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isPending}
            />
            <button
              className={styles.submitCategoryButton}
              disabled={isPending}
              type="submit"
            >
              Submit
            </button>
          </div>
          {errorMsg ? (
            <p className={styles.formMessage} role="alert">
              {errorMsg}
            </p>
          ) : null}
        </form>
      ) : null}

      {selectedCategory ? (
        <CategoryDetails
          category={selectedCategory}
          removeCategory={removeCategory}
          closeDetails={() => {
            setErrorMsg("");
            setSelectedCategory(null);
          }}
          isPending={isPending}
          errorMsg={errorMsg}
        />
      ) : null}

      <div className={styles.gridWrapper}>
        <div className={styles.categoryGrid}>
          {categories.map((category) => {
            return (
              <button
                className={styles.categoryBubble}
                key={category.id}
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setSelectedCategory(category);
                }}
              >
                {category.category_name}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
