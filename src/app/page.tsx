import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { AppLogo } from "@/components/ui/icons/AppLogo";

export default function Home() {
  return (
    <div>
      <div className="flex-center">
        <h1>Welcome</h1>
      </div>
      <div className="space-between gap">
        <Link href="login" className="link-btn">
          Login
        </Link>
        <Link href="signup" className="link-btn">
          Signup
        </Link>
      </div>
      <AppLogo />
    </div>
  );
}
