"use client";

import { useState } from "react";
import styles from "./nav-bar.module.css";
import { logout } from "@/app/(auth)/actions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/general/app-name";

export default function NavBar() {
  const path = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Home" },
    { href: "/tutorial", label: "Help" },
    { href: "/upload", label: "Add a Spreadsheet" },
    { href: "/files", label: "Manage My Spreadsheets" },
    {
      href: "/transactions/review",
      label: "Review Transactions",
    },
    {
      href: "/transactions/categories",
      label: "Categories",
    },
    { href: "/goals", label: "Savings Goals" },
    { href: "/settings", label: "Settings" },
  ];

  function isActive(href: string) {
    return path === href || path.startsWith(`${href}/`);
  }

  function closeNav() {
    setIsOpen(false);
  }

  return (
    <>
      <div className={styles.mobileTopBar}>
        <button
          type="button"
          className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ""}`}
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="primary-nav"
          aria-expanded={isOpen}
        >
          <span />
          <span />
          <span />
        </button>
        <span className={styles.mobileTitle}>{APP_NAME}</span>
      </div>

      <button
        type="button"
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`}
        onClick={closeNav}
        aria-label="Close navigation menu"
      />

      <nav
        id="primary-nav"
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
        aria-label="Primary"
      >
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navItem} ${isActive(item.href) ? styles.active : ""}`}
                onClick={closeNav}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <form action={logout}>
              <button
                type="submit"
                className={styles.navItem}
                onClick={closeNav}
              >
                Logout
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </>
  );
}
