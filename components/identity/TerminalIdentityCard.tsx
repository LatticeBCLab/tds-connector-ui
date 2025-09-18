"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useGetTerminal } from "@/lib/gen/hooks/useGetTerminal";
import { formatDateTime } from "@/lib/utils";
import { AlertCircle, CheckCircle, Copy, Key, Monitor } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface TerminalIdentityCardProps {
  terminalDID: string | null;
}

export function TerminalIdentityCard({
  terminalDID,
}: TerminalIdentityCardProps) {
  const { toast } = useToast();
  const t = useTranslations("Identity");

  // Fetch terminal data
  const {
    data: terminalData,
    isLoading: isLoadingTerminal,
    error: terminalError,
  } = useGetTerminal(terminalDID || "", {
    query: {
      enabled: !!terminalDID,
    },
  });

  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t("copySuccess"),
        description: `${description} ${t("copiedToClipboard")}`,
      });
    } catch (err) {
      toast({
        title: t("copyFailed"),
        description: t("failedToCopy"),
        variant: "destructive",
      });
    }
  };

  const ErrorDisplay = ({ error, title }: { error: any; title: string }) => (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex items-center gap-3 p-6">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <div>
          <h4 className="font-medium text-red-800">{title}</h4>
          <p className="text-sm text-red-600">
            {error?.message || t("loadError")}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const LoadingDisplay = ({ title }: { title: string }) => (
    <Card className="border-border border">
      <CardContent className="flex flex-col items-center gap-3 p-6">
        <Spinner variant="bars" />
        <h4 className="font-medium">{title}</h4>
      </CardContent>
    </Card>
  );

  if (!terminalDID) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="flex items-center gap-3 p-6">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <div>
            <h4 className="font-medium text-yellow-800">
              Terminal Not Configured
            </h4>
            <p className="text-sm text-yellow-600">
              Terminal DID is not set in environment variables
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingTerminal) {
    return <LoadingDisplay title="Loading Terminal..." />;
  }

  if (terminalError) {
    return <ErrorDisplay error={terminalError} title="Terminal Load Error" />;
  }

  return (
    <Card className="border-border border">
      <CardHeader className="border-b border-gray-200 pb-6">
        <CardTitle>{t("terminal.title")}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {t("terminal.description")}
        </CardDescription>
      </CardHeader>

      {/* 基本信息部分 */}
      <CardContent className="px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              {t("terminal.DID")}
            </p>
            <div className="flex items-center gap-2">
              <code className="bg-muted line-clamp-1 flex-grow rounded-lg font-mono text-sm break-all">
                {terminalData?.terminalDid || terminalDID}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(
                    terminalData?.terminalDid || terminalDID || "",
                    "Terminal DID"
                  )
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              {t("terminal.name")}
            </p>
            <div className="bg-muted flex h-9 items-center rounded-lg">
              <span className="font-medium">
                {terminalData?.terminalName || t("noName")}
              </span>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              {t("terminal.version")}
            </p>
            <div className="bg-muted rounded-lg">
              <span className="font-medium">
                {terminalData?.version || t("noVersion")}
              </span>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              {t("terminal.status")}
            </p>
            <div className="bg-muted rounded-lg">
              <span className="flex items-center gap-1 font-medium text-green-600">
                <CheckCircle className="h-4 w-4" />
                {terminalData?.status || "Connected"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              {t("creationTime")}
            </p>
            <div className="bg-muted rounded-lg">
              <span className="font-medium">
                {formatDateTime(terminalData?.createdAt, {
                  fallback: t("noCreationTime"),
                })}
              </span>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              {t("terminal.endpoint")}
            </p>
            <div className="bg-muted rounded-lg">
              <a
                href={terminalData?.serviceEndpoint}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary truncate overflow-hidden font-medium hover:underline"
              >
                {terminalData?.serviceEndpoint || "No endpoint"}
              </a>
            </div>
          </div>
        </div>
      </CardContent>

      {/* 终端详细信息 */}
      <div className="border-t border-gray-100">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 公钥信息 */}
            <Card className="border-border border">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Key className="text-primary h-5 w-5" />
                    </div>
                    <CardTitle>{t("publicKeyInfo")}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {t("publickeyVerification")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-muted-foreground mb-1 text-sm">
                      {t("algorithmType")}
                    </p>
                    <code className="bg-muted block rounded font-mono text-sm">
                      {terminalData?.publicKeyType || "Unknown"}
                    </code>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 text-sm">
                      {t("publicKeyBase58")}
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted flex-1 truncate rounded font-mono text-sm break-all">
                        {terminalData?.publicKeyBase58 || t("noPublicKey")}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            terminalData?.publicKeyBase58 || "",
                            t("publicKeyBase58")
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 服务信息 */}
            <Card className="border-border border">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Monitor className="text-primary h-5 w-5" />
                    </div>
                    <CardTitle>{t("terminalService")}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {t("service")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-muted-foreground mb-1 text-sm">
                      {t("serviceType")}
                    </p>
                    <code className="bg-muted block rounded font-mono text-sm">
                      {terminalData?.serviceType || "Unknown"}
                    </code>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 text-sm">
                      {t("serviceId")}
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <code className="bg-muted block truncate rounded font-mono text-sm break-all">
                          {terminalData?.serviceId || "Unknown"}
                        </code>
                      </TooltipTrigger>
                      <TooltipContent >
                        {terminalData?.serviceId || "Unknown"}
                      </TooltipContent>
                    </Tooltip>

                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
