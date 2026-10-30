"use client";
import { FiCalendar, FiClipboard, FiFileText } from "react-icons/fi";
import Shell from "@/components/Shell";

const links = [
  { href: "/patient", label: "Book appointment", icon: FiCalendar },
  { href: "/patient/appointments", label: "My appointments", icon: FiClipboard },
  { href: "/patient/bills", label: "Your bills", icon: FiFileText },
];

export default function Layout({ children }) {
  return <Shell role="patient" links={links}>{children}</Shell>;
}
