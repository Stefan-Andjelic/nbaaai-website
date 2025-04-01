import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "NBAAAI - Stats and Predictions",
  description: "Best insights and predictions for the NBA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
