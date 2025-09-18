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
import { useGetConnectorByDID } from "@/lib/gen/hooks/useGetConnectorByDID";
import { formatDateTime } from "@/lib/utils";
import {
  AlertCircle,
  Code,
  Copy,
  Eye,
  FileText,
  IdCard,
  Key,
  Lock,
  Shield,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface ConnectorIdentityCardProps {
  connectorDID: string | null;
}

export function ConnectorIdentityCard({ connectorDID }: ConnectorIdentityCardProps) {
  const { toast } = useToast();
  const t = useTranslations("Identity");
  const [didViewMode, setDidViewMode] = useState<"visual" | "json">("visual");

  const {
    data: connectorData,
    isLoading: isLoadingConnector,
    error: connectorError,
  } = useGetConnectorByDID(connectorDID || "", {
    query: {
      enabled: !!connectorDID,
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

  const DIDDocumentVisualView = () => {
    if (!connectorData?.didDoc) return null;

    const didDoc = connectorData.didDoc;

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 标识符卡片 */}
        <Card className="border-border border">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <IdCard className="text-primary h-5 w-5" />
                </div>
                <CardTitle>{t("identifier")}</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {t("uniqueIdentifier")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-muted-foreground mb-2 text-sm">
                {t("didSubjectIdentifier")}
              </p>
              <div className="flex items-center gap-2">
                <code className="bg-muted flex-1 rounded font-mono text-sm break-all">
                  {didDoc.id || connectorData.connectorDid}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      didDoc.id || connectorData.connectorDid || "",
                      t("didIdentifier")
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 认证方式卡片 */}
        <Card className="border-border border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Lock className="text-primary h-5 w-5" />
                </div>
                <CardTitle>{t("authentication")}</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {t("authMethod")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-muted-foreground mb-2 text-sm">
                {t("publicKeyAuth")}
              </p>
              <code className="bg-muted block rounded font-mono text-sm break-all">
                {didDoc.authentication?.[0] ||
                  connectorData.authentication ||
                  t("noAuthentication")}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* 公钥信息卡片 */}
        <Card className="border-border border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Key className="text-primary h-5 w-5" />
                </div>
                <CardTitle>{t("publicKeyInfo")}</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {didDoc.verificationMethod?.length || "0"} {t("keys")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {didDoc.verificationMethod &&
            didDoc.verificationMethod.length > 0 ? (
              <div>
                <p className="text-muted-foreground mb-2 text-sm">
                  {t("verificationKey")}
                </p>
                <code className="mb-3 block font-mono text-sm">
                  {didDoc.verificationMethod[0].id ||
                    connectorData.publicKeyIdentifier}
                </code>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-100 py-2">
                    <span className="text-muted-foreground text-sm">
                      {t("algorithmType")}
                    </span>
                    <span className="text-sm font-medium">
                      {didDoc.verificationMethod[0].type ||
                        connectorData.publicKeyType}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mb-1 block text-sm">
                      {t("publicKeyBase58")}
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted flex-1 truncate rounded font-mono text-sm break-all">
                        {didDoc.verificationMethod?.[0]?.publicKeyBase58 ||
                          didDoc.verificationMethod?.[0]?.publicKeyMultibase ||
                          connectorData.publicKeyBase58 ||
                          t("noPublicKey")}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            didDoc.verificationMethod?.[0]?.publicKeyBase58 ||
                              didDoc.verificationMethod?.[0]
                                ?.publicKeyMultibase ||
                              connectorData.publicKeyBase58 ||
                              "",
                            t("publicKeyBase58")
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t("noVerificationMethods")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 服务信息卡片 */}
        <Card className="border-border border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Shield className="text-primary h-5 w-5" />
                </div>
                <CardTitle>{t("serviceEndpoints")}</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {didDoc.service?.length || "0"} {t("service")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {didDoc.service && didDoc.service.length > 0 ? (
              <div>
                <p className="text-muted-foreground mb-2 text-sm">
                  {t("connectorServiceInterface")}
                </p>
                <code className="mb-3 block font-mono text-sm">
                  {didDoc.service[0].id || connectorData.serviceId}
                </code>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-100 py-2">
                    <span className="text-muted-foreground text-sm">
                      {t("serviceType")}
                    </span>
                    <span className="text-sm font-medium">
                      {didDoc.service[0].type || connectorData.serviceType}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mb-1 block text-sm">
                      {t("serviceAddress")}
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={
                          didDoc.service?.[0]?.serviceEndpoint ||
                          connectorData.serviceEndpoint
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-muted text-primary flex-1 truncate rounded font-mono text-sm break-all hover:underline"
                      >
                        {didDoc.service?.[0]?.serviceEndpoint ||
                          connectorData.serviceEndpoint}
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            didDoc.service?.[0]?.serviceEndpoint ||
                              connectorData.serviceEndpoint ||
                              "",
                            t("serviceAddress")
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t("noServices")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!connectorDID) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="flex items-center gap-3 p-6">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <div>
            <h4 className="font-medium text-yellow-800">
              {t("connectorNotConfigured")}
            </h4>
            <p className="text-sm text-yellow-600">
              {t("connectorDidNotSet")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingConnector) {
    return <LoadingDisplay title={t("loadingConnector")} />;
  }

  if (connectorError) {
    return (
      <ErrorDisplay
        error={connectorError}
        title={t("connectorLoadError")}
      />
    );
  }

  return (
    <Card className="border-border border">
      <CardHeader className="border-b border-gray-200 pb-6">
        <CardTitle>{t("connectorIdentity")}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {t("connectorDescription")}
        </CardDescription>
      </CardHeader>

      {/* 基本信息部分 */}
      <CardContent className="px-6">
        <div className="grid grid-cols-1 space-x-6 space-y-2 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              {t("didIdentifier")}
            </p>
            <div className="flex items-center gap-2">
              <code className="bg-muted line-clamp-1 flex-grow rounded-lg font-mono text-sm break-all">
                {connectorData?.connectorDid || connectorDID}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(
                    connectorData?.connectorDid || connectorDID,
                    t("didIdentifier")
                  )
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              {t("connectorName")}
            </p>
            <div className="bg-muted rounded-lg h-9 flex items-center">
              <span className="font-medium">
                {connectorData?.connectorName || t("noName")}
              </span>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              {t("connectorVersion")}
            </p>
            <div className="bg-muted rounded-lg">
              <span className="font-medium">
                {connectorData?.version || t("noVersion")}
              </span>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              {t("creationTime")}
            </p>
            <div className="bg-muted rounded-lg">
              <span className="font-medium">
                {formatDateTime(connectorData?.createdAt, {
                  fallback: t("noCreationTime"),
                })}
              </span>
            </div>
          </div>
          <div className="h-[48px]"></div>
        </div>
      </CardContent>

      {/* DID文档子部分 */}
      <div className="border-t border-gray-100">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-6 pb-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="flex items-center gap-2 font-semibold">
              <FileText className="text-primary h-5 w-5" />
              <span>{t("didDocument")}</span>
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("viewDetailContent")}
            </p>
          </div>

          {/* 视图切换按钮组 */}
          <div className="flex gap-2">
            <Button
              variant={
                didViewMode === "visual" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setDidViewMode("visual")}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant={didViewMode === "json" ? "default" : "outline"}
              size="sm"
              onClick={() => setDidViewMode("json")}
              className="flex items-center gap-2"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-6">
          {didViewMode === "visual" ? (
            <DIDDocumentVisualView />
          ) : (
            <div className="space-y-4">
              <pre className="bg-muted overflow-x-auto rounded-lg p-6 font-mono text-sm leading-relaxed">
                {JSON.stringify(connectorData?.didDoc || {}, null, 2)}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(
                      connectorData?.didDoc || {},
                      null,
                      2
                    ),
                    `${t("didDocument")} JSON`
                  )
                }
              >
                <Copy className="mr-2 h-4 w-4" />
                {t("copyJson")}
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
