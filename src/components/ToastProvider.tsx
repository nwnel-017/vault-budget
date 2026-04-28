"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      pauseOnHover
      pauseOnFocusLoss
      closeOnClick={false}
      newestOnTop={false}
      limit={3}
      role="alert"
    />
  );
}
