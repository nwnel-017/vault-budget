"use client";

import styles from "./nav-bar.module.css";
import { logout } from "@/app/(auth)/actions";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const path = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Home" },
    { href: "/tutorial", label: "Help" },
    { href: "/upload", label: "Add a Spreadsheet" },
    { href: "/transactions/review", label: "Review Transactions" },
    { href: "/transactions/categories", label: "Categories" },
    { href: "/goals", label: "Savings Goals" },
    { href: "/settings", label: "Settings" },
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
          <li>
            <form action={logout}>
              <button type="submit" className={styles.navItem}>
                Logout
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </>
  );
}
