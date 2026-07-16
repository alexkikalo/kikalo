import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kikalo | Tools for Builders · American Engineering",
  description: "Premium modular enclosures, guided engineering software, and durable tools for makers, engineers, and teams. Made in North Texas.",
  icons: {
    icon: "/images/Color.png",
    shortcut: "/images/Color.png",
    apple: "/images/Color.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
