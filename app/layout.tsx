import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "NumiFin — AI-Powered Finance Platform",
    template: "%s | NumiFin",
  },
  description:
    "The autonomous AI finance department for founders, freelancers, and growing teams. Categorize, reconcile, and understand your finances — powered by AI agents.",
  keywords: ["accounting", "AI finance", "bookkeeping", "reconciliation", "expense tracking"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FAFAFA] antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "white",
              border: "1px solid #E1E1E1",
              color: "#1a1a2e",
            },
          }}
        />
      </body>
    </html>
  );
}
