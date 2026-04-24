"use client";

import styles from "./nav-bar.module.css";
import { logout } from "@/app/(auth)/actions";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const path = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Home" },
    { href: "/tutorial", label: "Instructions" },
    { href: "/upload", label: "Add a Spreadsheet" },
    { href: "/transactions/review", label: "Review Transactions" },
    { href: "/transactions/categories", label: "Categories" },
    { href: "/goals", label: "Savings Goals" },
    { href: "/settings", label: "Settings" },
    { href: "/logout", label: "Logout" },
  ];

  function isActive(href: string) {
    return path === href || path.startsWith(`${href}/`);
  }

  return (
    <>
      <div className="hamburger">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <nav className={styles.sidebar} aria-label="Primary">
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navItem} ${isActive(item.href) ? styles.active : ""}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {/* <li>
            <Link href="/dashboard" className={styles.navItem}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/tutorial" className={styles.navItem}>
              Instructions
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
            <Link href="/goals" className={styles.navItem}>
              Savings Goals
            </Link>
          </li>
          <li>
            <Link href="/settings" className={styles.navItem}>
              Settings
            </Link>
          </li>
          <li onClick={logout} className={styles.navItem}>
            Logout
          </li> */}
        </ul>
      </nav>
    </>
  );
}
