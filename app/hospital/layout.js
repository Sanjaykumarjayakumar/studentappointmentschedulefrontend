"use client";
import { FiUserPlus } from "react-icons/fi";
import Shell from "@/components/Shell";

const links = [{ href: "/hospital", label: "Add staff", icon: FiUserPlus }];

export default function Layout({ children }) {
  return <Shell role="hospital" links={links}>{children}</Shell>;
}
