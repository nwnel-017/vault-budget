"use client";

import { login } from "../actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/components/ui/Button";
import styles from "./AuthForm.module.css";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    setIsLoading(true);

    const res = await login(email, password);

    if (!res.success) {
      setError(res?.message || "Login failed. Please try again.");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <form onSubmit={submit} className={styles.form}>
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
      <Button disabled={isLoading} fullWidth type="submit">
        {isLoading ? "Logging in..." : "Login"}
      </Button>
      {error ? <p className={styles.error}>{error}</p> : null}
    </form>
  );
}
