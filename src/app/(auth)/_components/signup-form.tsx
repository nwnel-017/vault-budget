"use client";

import { signup } from "../actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupForm() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);

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
    <form onSubmit={submit} className="signup-form">
      <label htmlFor="name">Name</label>
      <input id="name" name="name" required />
      <label htmlFor="email">Email</label>
      <input id="email" name="email" required />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" required />
      <button className="btn">Signup</button>
      {error ? <p>{error}</p> : null}
    </form>
  );
}
