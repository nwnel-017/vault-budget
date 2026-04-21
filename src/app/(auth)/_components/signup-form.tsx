"use client";

import { signup } from "../actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import Button from "@/app/components/ui/Button";
import styles from "./AuthForm.module.css";

export default function SignupForm() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const res = await signup(email, password, name);

    if (!res.success) {
      setError(res.message);
    } else {
      router.push("/login");
    }
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
      <Button fullWidth type="submit">
        Signup
      </Button>
      {error ? <p className={styles.error}>{error}</p> : null}
    </form>
  );
}
