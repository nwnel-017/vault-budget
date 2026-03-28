"use client";

import { login } from "../actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await login(email, password);

    if (res.error) {
      setError(res.error);
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={submit} className="signup-form">
      <label htmlFor="email">Email</label>
      <input id="email" name="email" required />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" required />
      <button className="btn">Login</button>
      {error ? <p>{error}</p> : null}
    </form>
  );
}
