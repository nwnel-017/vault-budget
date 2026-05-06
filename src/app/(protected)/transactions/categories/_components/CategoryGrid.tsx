"use client";

import { useState } from "react";
import CategoryDetails from "./CategoryDetails";
import { createCategory, deleteCategory, editCategoryName } from "../actions";
import styles from "../page.module.css";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import ArrowRight from "@/components/ui/icons/ArrowRight";
import type { CategorySummary } from "@/types/category";

type CategoryGridProps = {
  categories: CategorySummary[];
};

// Reviewed
export default function CategoryGrid({ categories }: CategoryGridProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [category, setCategory] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategorySummary | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");

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

  async function updateCategoryName() {
    if (!selectedCategory) {
      return;
    }

    if (!editedCategoryName.trim()) {
      setErrorMsg("No category entered");
      return;
    }

    setErrorMsg("");
    setIsPending(true);

    try {
      const response = await editCategoryName(
        selectedCategory.id,
        editedCategoryName,
      );

      if (!response.success) {
        setErrorMsg(response.error ?? "Unable to update category.");
        return;
      }

      setSelectedCategory({
        ...selectedCategory,
        category_name: editedCategoryName.trim(),
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      {selectedCategory ? (
        <CategoryDetails
          category={selectedCategory}
          removeCategory={removeCategory}
          updateCategoryName={updateCategoryName}
          closeDetails={() => {
            setErrorMsg("");
            setEditedCategoryName("");
            setSelectedCategory(null);
          }}
          editedCategoryName={editedCategoryName}
          setEditedCategoryName={setEditedCategoryName}
          isPending={isPending}
          errorMsg={errorMsg}
        />
      ) : null}

      <div className={styles.gridWrapper}>
        <div className={styles.gridTopBar}>
          <div className={styles.header}>
            <h1>My Spending Categories</h1>
            <button
              className={styles.addCategoryButton}
              type="button"
              onClick={() => setIsFormOpen((current) => !current)}
            >
              <PlusIcon />
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
        </div>

        <div className={styles.categoryGrid}>
          {categories.length > 0 ? (
            categories.map((category) => {
              return (
                <button
                  className={styles.categoryBubble}
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setEditedCategoryName(category.category_name);
                    setSelectedCategory(category);
                  }}
                >
                  {category.category_name}
                  <ArrowRight />
                </button>
              );
            })
          ) : (
            <p>No categories found.</p>
          )}
        </div>
      </div>
    </>
  );
}
