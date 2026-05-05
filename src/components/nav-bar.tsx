"use client";

import styles from "./nav-bar.module.css";
import { logout } from "@/app/(auth)/actions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeIcon from "./ui/icons/HomeIcon";
import HelpIcon from "./ui/icons/HelpIcon";
import CloudUploadIcon from "./ui/icons/CloudUploadIcon";
import FileIcon from "./ui/icons/FileIcon";
import ReviewIcon from "./ui/icons/ReviewIcon";
import TagIcon from "./ui/icons/TagIcon";
import TargetIcon from "./ui/icons/TargetIcon";
import SettingsIcon from "./ui/icons/SettingsIcon";
import LogoutIcon from "./ui/icons/LogoutIcon";

export default function NavBar() {
  const path = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Home", icon: <HomeIcon /> },
    { href: "/tutorial", label: "Help", icon: <HelpIcon /> },
    { href: "/upload", label: "Add a Spreadsheet", icon: <CloudUploadIcon /> },
    { href: "/files", label: "Manage My Spreadsheets", icon: <FileIcon /> },
    {
      href: "/transactions/review",
      label: "Review Transactions",
      icon: <ReviewIcon />,
    },
    {
      href: "/transactions/categories",
      label: "Categories",
      icon: <TagIcon />,
    },
    { href: "/goals", label: "Savings Goals", icon: <TargetIcon /> },
    { href: "/settings", label: "Settings", icon: <SettingsIcon /> },
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
                {/* {item.icon && (
                  <span className={styles.navIcon}>{item.icon}</span>
                )} */}
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <form action={logout}>
              <button type="submit" className={styles.navItem}>
                {/* <LogoutIcon /> */}
                Logout
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </>
  );
}
