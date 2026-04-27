"use client";

import { toast } from "react-toastify";

// keep the app toast calls simple and consistent
export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(message: string) {
  toast.error(message);
}
