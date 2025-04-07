import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import MUIThemeProvider from "@/components/MUIThemeProvider";

export const metadata: Metadata = {
  title: "NBAAAI - Stats and Predictions",
  description: "Best insights and predictions for the NBA",
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <MUIThemeProvider>
            <Navbar />
            <main>
              {children}
            </main>
          </MUIThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
