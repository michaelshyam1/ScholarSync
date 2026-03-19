import type { Metadata } from "next";
import { Cinzel, Lora } from "next/font/google";
import "@/styles/globals.css";
import { Navbar } from "@/components/generic/Navbar";
import { Toaster } from "@/components/ui/sonner";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cinzel",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "ScholarSync | Home",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cinzel.variable} ${lora.variable} my_theme`}>
      <body>
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
