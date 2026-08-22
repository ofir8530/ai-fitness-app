import type { Metadata, Viewport } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/components/ModalContext";
import ModalWrapper from "@/components/ModalWrapper";
import ConditionalBottomNav from "@/components/ConditionalBottomNav";
import { ProgressProvider } from "@/components/ProgressContext";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Calceat — כושר ותזונה",
  description: "אפליקציית כושר ותזונה חכמה בעברית",
  applicationName: "Calceat",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Calceat",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4a654e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${manrope.variable} ${plusJakarta.variable} h-full`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="h-full bg-surface-dim text-on-surface font-body text-body-md antialiased">
        <div className="app-shell relative mx-auto flex h-full min-h-dvh w-full max-w-[430px] flex-col bg-surface shadow-[0_0_40px_rgba(0,0,0,0.08)] sm:min-h-[100dvh]">
          <ModalProvider>
            <ProgressProvider>
              <main className="min-h-0 flex-grow overflow-y-auto overscroll-y-contain">
                {children}
              </main>
              <ConditionalBottomNav />
              <ModalWrapper />
            </ProgressProvider>
          </ModalProvider>
        </div>
      </body>
    </html>
  );
}
