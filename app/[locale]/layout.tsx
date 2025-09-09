import { AppInitializer } from "@/components/app-initializer";
import Header from "@/components/header";
import QueryClientProvider from "@/components/providers/QueryClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { routing } from "@/i18n/routing";
import { DataSpaceProvider } from "@/lib/contexts/DataSpaceContext";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { notFound } from "next/navigation";
import type React from "react";
import "../globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <div
      className={`${playfair.variable} ${sourceSans.variable} font-sans antialiased`}
    >
      <QueryClientProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DataSpaceProvider>
            <AppInitializer />
            <div className="bg-background min-h-screen">
              <Header />

              {/* Main Content */}
              <div className="container mx-auto px-6 pb-8">{children}</div>
            </div>
          </DataSpaceProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}
