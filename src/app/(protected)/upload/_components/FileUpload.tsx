"use client";

import { normalizeFile, uploadInput } from "../actions";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import FileConfig from "./FileConfig";
import FieldMapping from "./FieldMapping";
import styles from "./FileUpload.module.css";

const MAX_SERVER_ACTION_FILE_SIZE_BYTES = 1024 * 1024;

type FieldMap = {
  amount: string;
  date_purchased: string;
  merchant: string;
} | null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className={styles.submitButton} type="submit" disabled={pending}>
      {pending ? "Uploading..." : "Upload CSV"}
    </button>
  );
}

export default function FileUpload({ fieldMap }: { fieldMap: FieldMap }) {
  const [file, setFile] = useState<File | null>(null);
  const [showFileConfig, setShowFileConfig] = useState(false);
  const [showFieldMapping, setShowFieldMapping] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);

  function fileExceedsSizeLimit(selectedFile: File) {
    return selectedFile.size > MAX_SERVER_ACTION_FILE_SIZE_BYTES;
  }

  function change(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;

    if (selectedFile && fileExceedsSizeLimit(selectedFile)) {
      alert("File size must not exceed 1 MB.");
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
      alert("No file!");
      return;
    }

    if (fileExceedsSizeLimit(file)) {
      alert("File size must not exceed 1 MB.");
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
      alert("Something went wrong!");
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
      alert("No file!");
      return;
    }

    if (fileExceedsSizeLimit(file)) {
      alert("File size must not exceed 1 MB.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    const res = await uploadInput(
      form,
      selectedColumns.merchantField,
      selectedColumns.amountField,
      selectedColumns.dateField,
    );

    if (!res.success) {
      alert(res.error ?? "Something went wrong!");
      return;
    }

    setShowFileConfig(false);
    alert("Upload complete.");
  }

  async function uploadWithSavedMappings() {
    if (!file || !fieldMap) {
      alert("No file!");
      return;
    }

    if (fileExceedsSizeLimit(file)) {
      alert("File size must not exceed 1 MB.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    const res = await uploadInput(
      form,
      fieldMap.merchant,
      fieldMap.amount,
      fieldMap.date_purchased,
    );

    if (!res.success) {
      alert(res.error ?? "Something went wrong!");
      return;
    }

    setShowFieldMapping(false);
    alert("Upload complete.");
  }

  function reviewMappingsManually() {
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
              Upload your CSV file and Budget Vault will guide you through the
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
              Example: instead of exporting `11/1/2026` through `12/1/2026`,
              export `11/1/2026` through `11/31/2026`.
            </p>
          </div>

          <form onSubmit={submit} className={styles.form}>
            <label className={styles.fileLabel} htmlFor="csv-file">
              Choose your CSV file
            </label>
            {/* Keep the native picker so the upload flow stays reliable */}
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
            {file ? <span className={styles.filePill}>{file.name}</span> : null}
            <SubmitButton />
          </form>
        </div>
      </section>
    </>
  );
}
