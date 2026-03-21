import Link from "next/link";
import LoginForm from "@/components/login-form";
import { login } from "../actions";

export default function Login() {
  return (
    <div>
      <div className="flex-center">
        <h1>Login</h1>
      </div>
      <LoginForm loginAction={login} />
      <div className="space-between gap">
        <Link href="signup" className="link-btn">
          Signup
        </Link>
        <Link href="/" className="link-btn">
          Home
        </Link>
      </div>
    </div>
  );
}
