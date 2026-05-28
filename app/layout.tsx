import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mycareerpilot",
  description: "A calm AI workspace for job search, CV creation, manual applications, and application tracking."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
