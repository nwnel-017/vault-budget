import styles from "./nav-bar.module.css";
import { logout } from "@/app/(auth)/actions";
import Link from "next/link";

export default function NavBar() {
  return (
    <>
      <div className="hamburger">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <nav className={styles.sidebar} aria-label="Primary">
        <ul className={styles.navList}>
          <li>
            <Link href="/dashboard" className={styles.navItem}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/upload" className={styles.navItem}>
              Add a Spreadsheet
            </Link>
          </li>
          <li>
            <Link href="/transactions/review" className={styles.navItem}>
              Review Transactions
            </Link>
          </li>
          <li>
            <Link href="/transactions/categories" className={styles.navItem}>
              Categories
            </Link>
          </li>
          <li>
            <Link href="/settings" className={styles.navItem}>
              Settings
            </Link>
          </li>
          <li onClick={logout} className={styles.navItem}>
            Logout
          </li>
        </ul>
      </nav>
    </>
  );
}
