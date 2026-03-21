"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  signupAction: (email: string, password: string, name: string) => Promise<any>;
};

export default function SignupForm({ signupAction }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const submit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      alert("please enter all fields!");
    }

    try {
      setLoading(true);
      await signupAction(email, password, name);
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
      <label htmlFor="name">Name:</label>
      <input
        type="text"
        name="name"
        id="name"
        onChange={(e) => setName(e.target.value)}
      />
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
        <button type="submit">{loading ? "Signing up..." : "Signup"}</button>
      </div>
    </form>
  );
}
