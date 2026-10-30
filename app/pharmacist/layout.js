"use client";
import { FiActivity, FiFileText, FiPackage } from "react-icons/fi";
import Shell from "@/components/Shell";

const links = [
  { href: "/pharmacist", label: "Dashboard", icon: FiActivity },
  { href: "/pharmacist/medicines", label: "Medicine stock", icon: FiPackage },
  { href: "/pharmacist/bills/new", label: "Create bill", icon: FiFileText },
];

export default function Layout({ children }) {
  return <Shell role="pharmacist" links={links}>{children}</Shell>;
}
