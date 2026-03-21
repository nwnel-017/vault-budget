import Link from "next/link";
import { signup } from "../actions";
import SignupForm from "../../../components/signup-form";

export default function Signup() {
  async function login(e: React.SubmitEvent) {}

  return (
    <div>
      <div className="flex-center">
        <h1>Signup</h1>
      </div>
      <SignupForm signupAction={signup} />
      <div className="space-between gap">
        <Link href="login" className="link-btn">
          Login
        </Link>
        <Link href="/" className="link-btn">
          Home
        </Link>
      </div>
    </div>
  );
}
