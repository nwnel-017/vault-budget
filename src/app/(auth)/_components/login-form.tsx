"use client";

import { login } from "../actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import Button from "@/app/components/ui/Button";
import styles from "./AuthForm.module.css";

export default function LoginForm() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await login(email, password);

    if (!res.success) {
      setError(res?.message || "Login failed. Please try again.");
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
      <Button fullWidth type="submit">
        Login
      </Button>
      {error ? <p className={styles.error}>{error}</p> : null}
    </form>
  );
}
