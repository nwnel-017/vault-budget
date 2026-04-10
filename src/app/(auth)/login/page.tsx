import Link from "next/link";
import LoginForm from "../_components/login-form";
import { login } from "../actions";

export default function Login({ login }: { login: any }) {
  return (
    <div>
      <div className="flex-center">
        <h1>Login</h1>
      </div>
      <LoginForm />
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
