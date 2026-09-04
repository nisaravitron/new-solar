import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ek Badhyasi — Website Platform for Training Centers",
  description:
    "Sign up, get approved, and launch your training center's own website — the SaaS platform by Ek Badhyasi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
