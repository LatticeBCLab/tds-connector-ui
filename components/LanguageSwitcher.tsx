"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "@/i18n/navigation";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const [isPending] = useTransition();
  const handleLanguageChange = (newLocale: string) => {
    console.log("Current pathname:", pathname);
    console.log("Current locale:", locale);
    console.log("New locale:", newLocale);

    // Use window.location.href to navigate, ensuring a full reload
    const newUrl = `/${newLocale}${pathname}`;
    window.location.href = newUrl;
  };

  const languages = [
    { code: "zh-CN", name: "中文", flag: "🇨🇳" },
    { code: "en-US", name: "English", flag: "🇺🇸" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          disabled={isPending}
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLanguage?.flag} {currentLanguage?.name}
          </span>
          <span className="sm:hidden">{currentLanguage?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={locale === language.code ? "bg-muted" : ""}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
