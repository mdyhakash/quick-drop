"use client";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { useEffect } from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handle = (e: any) => {
      const { message, type } = e.detail || {};
      if (!message) return;
      if (type === "success") toast.success(message);
      else if (type === "error") toast.error(message);
      else toast.info(message);
    };
    window.addEventListener("show-toast", handle as EventListener);
    return () =>
      window.removeEventListener("show-toast", handle as EventListener);
  }, []);

  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <title>Quick Drop</title>
      </head>
      <body className="min-h-screen bg-background text-foreground">
        {children}
        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar
          theme="dark"
        />
      </body>
    </html>
  );
}
