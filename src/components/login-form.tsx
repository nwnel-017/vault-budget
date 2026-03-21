"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  loginAction: (email: string, password: string) => Promise<any>;
};

export default function LoginForm({ loginAction }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const submit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("please enter all fields!");
    }

    try {
      setLoading(true);
      await loginAction(email, password);
      router.push("/dashboard");
    } catch (err) {
      console.log(err);
      alert("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="signup-form">
      <label htmlFor="email">Email:</label>
      <input
        value={email}
        type="text"
        name="email"
        id="email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <label htmlFor="password">Password:</label>
      <input
        type="text"
        name="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="sign-up-btn">
        <button type="submit">{loading ? "Logging in..." : "Login"}</button>
      </div>
    </form>
  );
}
