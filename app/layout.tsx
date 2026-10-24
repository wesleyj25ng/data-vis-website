import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CVE Atlas | CS 6730",
  description: "Profiling software vulnerabilities over the years.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
