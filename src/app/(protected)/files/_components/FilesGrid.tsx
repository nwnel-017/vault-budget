"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toastError, toastSuccess } from "@/lib/toast";
import { deleteFile } from "../actions";
import styles from "./FilesGrid.module.css";

type FilesGridProps = {
  files: {
    id: string;
    file_name: string;
    start_date: string;
    end_date: string;
    created_at: string;
  }[];
};

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
}

export default function FilesGrid({ files }: FilesGridProps) {
  const [deletingFileId, setDeletingFileId] = useState("");
  const router = useRouter();

  async function removeFile(fileId: string) {
    if (!fileId) {
      return;
    }

    setDeletingFileId(fileId);

    try {
      const response = await deleteFile(fileId);

      if (!response.success) {
        toastError(response.error ?? "Unable to delete file.");
        return;
      }

      router.refresh();
      toastSuccess("File deleted!");
    } finally {
      setDeletingFileId("");
    }
  }

  return (
    <div className={styles.gridWrapper}>
      <div className={styles.gridTopBar}>
        <div className={styles.header}>
          <h1>Uploaded Files</h1>
        </div>
      </div>

      <div className={styles.gridHeader} role="row">
        <span>File Name</span>
        <span>Date From</span>
        <span>Date To</span>
        <span>Date Uploaded</span>
        <span className={styles.actionHeader}>Action</span>
      </div>

      <div className={styles.gridBody}>
        {files.length === 0 ? (
          <div className={styles.emptyState}>No files found.</div>
        ) : null}

        {files.map((file) => {
          const isDeleting = deletingFileId === file.id;

          return (
            <div className={styles.gridRow} key={file.id} role="row">
              <span className={styles.fileNameCell}>{file.file_name}</span>
              <span>{formatDate(file.start_date)}</span>
              <span>{formatDate(file.end_date)}</span>
              <span>{formatDate(file.created_at)}</span>
              <span className={styles.actionCell}>
                <button
                  className={styles.deleteButton}
                  type="button"
                  onClick={() => removeFile(file.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
