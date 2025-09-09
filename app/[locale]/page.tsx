"use client";

import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const router = useRouter();
  const t = useTranslations("Layout");

  useEffect(() => {
    router.replace("/identity");
  }, [router]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <Spinner variant="bars" />
      <p className="text-muted-foreground">{t("loading")}</p>
    </div>
  );
}
