type FileValidationResult =
  | {
      file: File;
      error: null;
    }
  | {
      file: null;
      error: string;
    };

export function sanitizeHeader(header: string): string {
  return header.replace(/^\uFEFF/, "").replace(/[^a-zA-Z0-9]/g, "");
}

export function sanitizeTextInput(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateCsvFile(form: FormData | null): FileValidationResult {
  if (!form) {
    return { file: null, error: "No file" };
  }

  const uploadedFile = form.get("file");

  if (!(uploadedFile instanceof File) || uploadedFile.size === 0) {
    return { file: null, error: "Please choose a CSV file." };
  }

  const isCsvFile = uploadedFile.name.toLowerCase().endsWith(".csv");

  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
  ];

  if (!isCsvFile || !allowedTypes.includes(uploadedFile.type)) {
    return { file: null, error: "Only .csv files are allowed." };
  }

  return { file: uploadedFile, error: null };
}

export function fileValidationErrorResult(error: string) {
  return {
    error,
    success: false,
    headers: [],
  };
}

export function normalizeTextValue(value: unknown): string {
  return String(value ?? "").trim();
}

export function normalizeAmountValue(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/[^0-9.-]/g, "");
}
