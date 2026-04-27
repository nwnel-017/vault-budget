"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
  return (
    <ToastContainer
      // keep one shared container for the whole app
      position="top-right"
      autoClose={4000}
      pauseOnHover
      pauseOnFocusLoss
      closeOnClick={false}
      newestOnTop={false}
      limit={3}
      role="alert"
      // ariaLabel="Notifications"
    />
  );
}
