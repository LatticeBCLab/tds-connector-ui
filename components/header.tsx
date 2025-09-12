"use client";

import { DataSpaceSwitcher } from "@/components/DataSpaceSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, useRouter } from "@/i18n/navigation";
import { useGetConnectorByDID } from "@/lib/gen/hooks/useGetConnectorByDID";
import { Moon, Settings, Shield, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

export default function Header() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const t = useTranslations("Header");
  const tLayout = useTranslations("Layout");

  // Fetch connector data
  const { data: connectorData } = useGetConnectorByDID(
    process.env.NEXT_PUBLIC_CONNECTOR_DID || "",
    {
      query: {
        enabled: !!process.env.NEXT_PUBLIC_CONNECTOR_DID,
      },
    }
  );

  // Get security level color and text
  const getSecurityLevelStyle = (level: string) => {
    switch (level?.toUpperCase()) {
      case "S":
        return {
          variant: "default" as const,
          className: "bg-green-600 hover:bg-green-700",
          text: "Security Level S",
        };
      case "A":
        return {
          variant: "default" as const,
          className: "bg-blue-600 hover:bg-blue-700",
          text: "Security Level A",
        };
      case "B":
        return {
          variant: "default" as const,
          className: "bg-yellow-600 hover:bg-yellow-700",
          text: "Security Level B",
        };
      case "C":
        return {
          variant: "default" as const,
          className: "bg-orange-600 hover:bg-orange-700",
          text: "Security Level C",
        };
      default:
        return {
          variant: "secondary" as const,
          className: "",
          text: "Unknown Level",
        };
    }
  };

  return (
    <div className="bg-card border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="text-primary h-8 w-8" />
              <h1 className="text-foreground hidden font-serif text-2xl font-bold md:block">
                {tLayout("title")}
              </h1>
            </Link>
            {/* Connector Info */}
            {connectorData && (
              <div className="ml-6 hidden items-center space-x-3 md:flex">
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="max-w-[200px] truncate text-sm font-medium"
                        >
                          {connectorData.connectorName || "Unknown Connector"}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={5}>
                        <div className="space-y-1 text-xs">
                          <div>Name: {connectorData.connectorName}</div>
                          <div>Version: {connectorData.version}</div>
                          <div>DID: {connectorData.connectorDid}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Security Level Badge */}
                {connectorData.securityRating?.overallLevel && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant={
                            getSecurityLevelStyle(
                              connectorData.securityRating.overallLevel
                            ).variant
                          }
                          className={`${getSecurityLevelStyle(connectorData.securityRating.overallLevel).className} text-white`}
                        >
                          <Shield className="h-3 w-3" />
                          {connectorData.securityRating.overallLevel}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={5}>
                        <div className="space-y-1 text-xs">
                          <div>
                            Security Score:{" "}
                            {connectorData.securityRating.overallScore}/100
                          </div>
                          <div>
                            Level: {connectorData.securityRating.overallLevel}
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div>
                              Identity:{" "}
                              <span className="text-green-400">●</span>
                            </div>
                            <div>
                              Communication:{" "}
                              <span className="text-green-400">●</span>
                            </div>
                            <div>
                              Access Control:{" "}
                              <span className="text-green-400">●</span>
                            </div>
                            <div>
                              Platform:{" "}
                              <span className="text-green-400">●</span>
                            </div>
                            <div>
                              Audit: <span className="text-green-400">●</span>
                            </div>
                            <div>
                              Privacy: <span className="text-green-400">●</span>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <DataSpaceSwitcher />
            <LanguageSwitcher />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">{t("toggleTheme")}</span>
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={5}>
                  {t("settings")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
