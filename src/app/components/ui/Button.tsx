import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "dot";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  fullWidth?: boolean;
  isActive?: boolean;
  variant?: ButtonVariant;
};

export default function Button({
  children,
  className = "",
  fullWidth = false,
  isActive = false,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "dot"
      ? `${styles.dot} ${isActive ? styles.dotActive : ""}`
      : styles.primary;

  const widthClass = fullWidth ? styles.fullWidth : "";

  return (
    <button
      {...props}
      type={type}
      className={`${styles.button} ${variantClass} ${widthClass} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
