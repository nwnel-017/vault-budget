"use client";

import { normalizeFile, uploadInput } from "./actions";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import FileConfig from "./_components/FileConfig";

const MAX_SERVER_ACTION_FILE_SIZE_BYTES = 1024 * 1024;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? "Uploading..." : "Upload CSV"}
    </button>
  );
}

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [showFileConfig, setShowFileConfig] = useState(false);
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

    alert("Upload complete.");
    setShowFileConfig(false);
  }

  return (
    <>
      <FileConfig
        active={showFileConfig}
        headers={headers}
        onComplete={handleFileConfigComplete}
      />
      <div className="file-upload-shell">
        <form onSubmit={submit} className="file-upload-form">
          <input
            onChange={change}
            type="file"
            name="csvFile"
            accept=".csv,text/csv"
            required
          />
          <SubmitButton />
        </form>
      </div>
    </>
  );
}
