"use client";

import { normalizeFile, uploadInput } from "../actions";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { APP_NAME } from "@/lib/general/app-name";
import { toastError, toastSuccess } from "@/lib/general/toast";
import FileConfig from "./FileConfig";
import FieldMapping from "./FieldMapping";
import { FileUploadIcon } from "@/components/ui/icons/FileUpload";
import type { FieldMap } from "@/types/upload";
import styles from "./FileUpload.module.css";

const MAX_SERVER_ACTION_FILE_SIZE_BYTES = 1024 * 1024;
const FILE_SIZE_ERROR_MESSAGE = "File size must not exceed 1 MB.";
const FILE_REQUIRED_ERROR_MESSAGE = "No file!";
const GENERIC_ERROR_MESSAGE = "Something went wrong!";
const UPLOAD_SUCCESS_MESSAGE = "Upload complete.";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className={styles.submitButton} type="submit" disabled={pending}>
      {pending ? "Uploading..." : "Upload CSV"}
    </button>
  );
}
export default function FileUpload({
  fieldMap,
}: {
  fieldMap: FieldMap | null;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [showFileConfig, setShowFileConfig] = useState(false);
  const [showFieldMapping, setShowFieldMapping] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const router = useRouter();

  function fileExceedsSizeLimit(selectedFile: File) {
    return selectedFile.size > MAX_SERVER_ACTION_FILE_SIZE_BYTES;
  }

  function change(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;

    if (selectedFile && fileExceedsSizeLimit(selectedFile)) {
      toastError(FILE_SIZE_ERROR_MESSAGE);
      event.target.value = "";
      setFile(null);
      setShowFileConfig(false);
      setShowFieldMapping(false);
      setHeaders([]);
      return;
    }

    setFile(selectedFile);
  }

  async function submit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!file) {
      toastError(FILE_REQUIRED_ERROR_MESSAGE);
      return;
    }

    if (fileExceedsSizeLimit(file)) {
      toastError(FILE_SIZE_ERROR_MESSAGE);
      return;
    }

    if (fieldMap) {
      setShowFieldMapping(true);
      setShowFileConfig(false);
      return;
    }

    const form = new FormData();
    form.append("file", file);

    const res = await normalizeFile(form);

    if (!res.success) {
      toastError(GENERIC_ERROR_MESSAGE);
    } else {
      console.log(res?.headers);
      setHeaders(res.headers);
      setShowFileConfig(true);
    }
  }

  async function handleFileConfigComplete(selectedColumns: {
    merchantField: string;
    amountField: string;
    dateField: string;
  }) {
    if (!file) {
      toastError(FILE_REQUIRED_ERROR_MESSAGE);
      return;
    }

    if (fileExceedsSizeLimit(file)) {
      toastError(FILE_SIZE_ERROR_MESSAGE);
      return;
    }

    const form = new FormData();
    form.append("file", file);

    const res = await uploadInput(
      form,
      selectedColumns.merchantField,
      selectedColumns.amountField,
      selectedColumns.dateField,
      file.name,
    );

    if (!res.success) {
      toastError(res.error ?? GENERIC_ERROR_MESSAGE);
      return;
    }

    setShowFileConfig(false);
    console.log(res);
    toastSuccess(res.message ?? UPLOAD_SUCCESS_MESSAGE);
    const nextUrl = res.limitReached
      ? "/transactions/review?freeTierLimitReached=true"
      : "/transactions/review";
    router.push(nextUrl);
  }

  async function loadHeadersForFile(selectedFile: File) {
    const form = new FormData();
    form.append("file", selectedFile);

    const res = await normalizeFile(form);

    if (!res.success) {
      toastError(GENERIC_ERROR_MESSAGE);
      return false;
    }

    setHeaders(res.headers);
    return true;
  }

  async function uploadWithSavedMappings() {
    if (!file || !fieldMap) {
      toastError(FILE_REQUIRED_ERROR_MESSAGE);
      return;
    }

    if (fileExceedsSizeLimit(file)) {
      toastError(FILE_SIZE_ERROR_MESSAGE);
      return;
    }

    const form = new FormData();
    form.append("file", file);

    const res = await uploadInput(
      form,
      fieldMap.merchant,
      fieldMap.amount,
      fieldMap.date_purchased,
      file.name,
    );

    if (!res.success) {
      toastError(res.error ?? GENERIC_ERROR_MESSAGE);
      return;
    }

    setShowFieldMapping(false);
    // Show the detailed success message returned by the server action.
    toastSuccess(res.message ?? UPLOAD_SUCCESS_MESSAGE);
    const nextUrl = res.limitReached
      ? "/transactions/review?freeTierLimitReached=true"
      : "/transactions/review";
    router.push(nextUrl);
  }

  async function reviewMappingsManually() {
    if (!file) {
      toastError(FILE_REQUIRED_ERROR_MESSAGE);
      return;
    }

    if (fileExceedsSizeLimit(file)) {
      toastError(FILE_SIZE_ERROR_MESSAGE);
      return;
    }

    // Load the headers first so the manual mapping step has choices to show.
    const headersLoaded = await loadHeadersForFile(file);

    if (!headersLoaded) {
      return;
    }

    setShowFieldMapping(false);
    setShowFileConfig(true);
  }

  return (
    <>
      <FieldMapping
        active={showFieldMapping}
        fieldMap={
          fieldMap ?? {
            amount: "",
            date_purchased: "",
            merchant: "",
          }
        }
        onConfirm={uploadWithSavedMappings}
        onCancel={reviewMappingsManually}
      />
      <FileConfig
        active={showFileConfig}
        headers={headers}
        onComplete={handleFileConfigComplete}
      />
      <section className={styles.shell}>
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.eyebrow}>Upload</span>
            <h1 className={styles.title}>Import a transaction spreadsheet</h1>
            <p className={styles.description}>
              Upload your CSV file and {APP_NAME} will guide you through the
              remaining setup.
            </p>
          </div>

          <div className={styles.notice}>
            <span className={styles.noticeTitle}>Important</span>
            <p className={styles.noticeText}>
              To track spending accurately, export a date range that does not
              overlap with a previous upload. Duplicate dates will create
              duplicate transactions.
            </p>
            <p className={styles.noticeText}>
              Example: instead of exporting 11/1/2026 through 12/1/2026, export
              11/1/2026 through 11/31/2026.
            </p>
          </div>

          <form onSubmit={submit} className={styles.form}>
            <div className={styles.iconContainer}>
              <div className="flex-col col-center gap">
                <label className={styles.fileLabel} htmlFor="csv-file">
                  Choose your CSV file
                </label>
                <label className={styles.fileTrigger} htmlFor="csv-file">
                  <FileUploadIcon />
                </label>
              </div>
            </div>
            <input
              className={styles.fileInput}
              id="csv-file"
              onChange={change}
              type="file"
              name="csvFile"
              accept=".csv,text/csv"
              required
            />
            <p className={styles.helperText}>Maximum file size: 1 MB.</p>
            {file ? (
              <>
                <span className={styles.filePill}>{file.name}</span>
                <SubmitButton />
              </>
            ) : null}
          </form>
        </div>
      </section>
    </>
  );
}
