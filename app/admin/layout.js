"use client";
import { FaHospital } from "react-icons/fa";
import Shell from "@/components/Shell";

const links = [{ href: "/admin", label: "Hospitals", icon: FaHospital }];

export default function Layout({ children }) {
  return <Shell role="admin" links={links}>{children}</Shell>;
}
