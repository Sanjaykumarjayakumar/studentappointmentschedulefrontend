"use client";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#0b1f44",
            border: "1px solid #c4dbff",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 500,
          },
          success: { iconTheme: { primary: "#1a5fe0", secondary: "#ffffff" } },
          error: { iconTheme: { primary: "#dc2626", secondary: "#ffffff" } },
        }}
      />
    </AuthProvider>
  );
}
