"use client";
import { FiClock, FiUsers } from "react-icons/fi";
import Shell from "@/components/Shell";

const links = [
  { href: "/doctor", label: "My slots", icon: FiClock },
  { href: "/doctor/appointments", label: "Appointments", icon: FiUsers },
];

export default function Layout({ children }) {
  return <Shell role="doctor" links={links}>{children}</Shell>;
}
