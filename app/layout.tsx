import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kikalo | Premium American Manufacturing & NovaShell Enclosures",
  description: "Precision modular aluminum enclosures and custom engineering. NovaShell — ready-to-ship and fully custom options. Made in North Texas.",
  icons: {
    icon: "/favicon.ico",
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
