"use client";

import { signup } from "../actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/components/ui/Button";
import styles from "./AuthForm.module.css";

export default function SignupForm() {
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const name = formData.get("name") as string;

    setIsLoading(true);

    const res = await signup(email, password, confirmPassword, name);

    if (!res.success) {
      setError(res.message);
    } else {
      setSuccessMsg(res.message);
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={submit} className={styles.form}>
      <label className={styles.label} htmlFor="name">
        Name
      </label>
      <input className={styles.input} id="name" name="name" required />
      <label className={styles.label} htmlFor="email">
        Email
      </label>
      <input className={styles.input} id="email" name="email" required />
      <label className={styles.label} htmlFor="password">
        Password
      </label>
      <input
        className={styles.input}
        id="password"
        name="password"
        type="password"
        required
      />
      <label className={styles.label} htmlFor="confirm-password">
        Reenter Password
      </label>
      <input
        className={styles.input}
        id="confirm-password"
        name="confirmPassword"
        type="password"
        required
      />
      <Button fullWidth type="submit">
        {isLoading ? "Signing up..." : "Signup"}
      </Button>
      {error ? <p className={styles.error}>{error}</p> : null}
      {successMsg ? <p className={styles.success}>{successMsg}</p> : null}
    </form>
  );
}
