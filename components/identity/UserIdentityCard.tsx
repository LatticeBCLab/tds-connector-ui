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
import { useGetUser } from "@/lib/gen/hooks/useGetUser";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Code,
  Copy,
  Eye,
  FileText,
  IdCard,
  Lock,
  Tag,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface UserIdentityCardProps {
  userDID: string | null;
}

export function UserIdentityCard({ userDID }: UserIdentityCardProps) {
  const { toast } = useToast();
  const t = useTranslations("Identity");
  const [vcViewMode, setVcViewMode] = useState<"visual" | "json">("visual");

  // Fetch user data
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useGetUser(userDID || "", {
    query: {
      enabled: !!userDID,
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

  const VCVisualView = () => {
    if (!userData?.credential)
      return (
        <div className="p-6 text-center">
          <p className="text-muted-foreground">{t("noCredential")}</p>
        </div>
      );

    const credential = userData.credential;

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* VC标识符卡片 */}
        <Card className="border-border border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <IdCard className="text-primary h-5 w-5" />
                </div>
                <CardTitle>{t("vcIdentifier")}</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {t("uniqueIdentifier")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-muted-foreground mb-2 text-sm">
                {t("credentialId")}
              </p>
              <div className="flex items-center gap-2">
                <code className="bg-muted flex-1 truncate rounded font-mono text-sm break-all">
                  {credential.id ||
                    userData.credentialId ||
                    t("noCredentialId")}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      credential.id || userData.credentialId || "",
                      t("vcIdentifier")
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 发行者卡片 */}
        <Card className="border-border border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <User className="text-primary h-5 w-5" />
                </div>
                <CardTitle>{t("issuerInfo")}</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {t("authority")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-muted-foreground mb-2 text-sm">
                  {t("issuerDid")}
                </p>
                <code className="bg-muted block rounded font-mono text-sm break-all">
                  {credential.issuer?.id ||
                    userData.issuerDid ||
                    t("noIssuerDid")}
                </code>
              </div>
              {(credential.issuer?.name || userData.issuerName) && (
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">
                    {t("issuerName")}
                  </p>
                  <p className="font-medium">
                    {credential.issuer?.name || userData.issuerName}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 发行信息卡片 */}
        <Card className="border-border border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Calendar className="text-primary h-5 w-5" />
                </div>
                <CardTitle className="whitespace-nowrap">
                  {t("issuanceInfo")}
                </CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {t("timeInfo")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-muted-foreground mb-2 text-sm">
                  {t("issuanceDate")}
                </p>
                <code className="bg-muted block rounded font-mono text-sm">
                  {formatDateTime(
                    credential.issuanceDate || userData.issuanceDate,
                    { fallback: t("noIssuanceDate") }
                  )}
                </code>
              </div>
              <div>
                <p className="text-muted-foreground mb-2 text-sm">
                  {t("expirationDate")}
                </p>
                <code className="bg-muted block rounded font-mono text-sm">
                  {formatDate(
                    userData.expirationDate,
                    "zh-CN",
                    t("noExpirationDate")
                  )}
                </code>
              </div>
              {userData.validFrom && (
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">
                    {t("validFrom")}
                  </p>
                  <code className="bg-muted block rounded font-mono text-sm">
                    {formatDateTime(userData.validFrom)}
                  </code>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 凭证类型卡片 */}
        <Card className="border-border border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Tag className="text-primary h-5 w-5" />
                </div>
                <CardTitle>{t("credentialType")}</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {credential.type?.length || "0"} {t("types")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {credential.type && credential.type.length > 0 ? (
                credential.type.map((type, index) => (
                  <div key={index} className="bg-muted rounded-lg p-2">
                    <p className="text-muted-foreground mb-1 text-sm">
                      {index === 0 ? t("baseType") : t("specificType")}
                    </p>
                    <code className="bg-muted block rounded font-mono text-sm">
                      {type}
                    </code>
                  </div>
                ))
              ) : userData.credentialTypes ? (
                <div className="bg-muted rounded-lg p-2">
                  <p className="text-muted-foreground mb-1 text-sm">
                    {t("credentialTypes")}
                  </p>
                  <code className="bg-muted block rounded font-mono text-sm">
                    {userData.credentialTypes}
                  </code>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t("noCredentialTypes")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 凭证主题卡片 */}
        <Card className="border-border col-span-full border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <User className="text-primary h-5 w-5" />
                </div>
                <CardTitle>{t("credentialSubject")}</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {t("subjectInfo")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground mb-2 text-sm">
                  {t("subjectDid")}
                </p>
                <code className="bg-muted mb-4 block rounded font-mono text-sm break-all">
                  {credential.credentialSubject?.id ||
                    userData.userDid ||
                    userDID}
                </code>
              </div>
              <div>
                <p className="text-muted-foreground mb-3 text-sm">
                  {t("userInfo")}
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-muted rounded-lg">
                    <p className="text-muted-foreground text-sm">{t("name")}</p>
                    <p className="font-medium">
                      {credential.credentialSubject?.userName ||
                        userData.userName ||
                        t("noName")}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg">
                    <p className="text-muted-foreground text-sm">
                      {t("identityType")}
                    </p>
                    <p className="font-medium">
                      {credential.credentialSubject?.userType ||
                        userData.userType ||
                        t("noType")}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg">
                    <p className="text-muted-foreground text-sm">
                      {t("organization")}
                    </p>
                    <p className="font-medium">
                      {credential.credentialSubject?.organization ||
                        userData.organization ||
                        t("noOrganization")}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg">
                    <p className="text-muted-foreground text-sm whitespace-nowrap">
                      {t("authStatus")}
                    </p>
                    <p className="flex items-center gap-1 font-medium text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      {credential.credentialSubject?.identityStatus ||
                        userData.identityStatus ||
                        t("verified")}
                    </p>
                  </div>
                  {userData.lastAuthenticatedAt && (
                    <div className="bg-muted rounded-lg">
                      <p className="text-muted-foreground text-sm">
                        {t("lastAuthTime")}
                      </p>
                      <p className="text-sm font-medium">
                        {formatDateTime(userData.lastAuthenticatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数字签名卡片 */}
        {credential.proof && (
          <Card className="border-border col-span-full border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Lock className="text-primary h-5 w-5" />
                  </div>
                  <CardTitle>{t("digitalSignature")}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {t("verificationInfo")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">
                    {t("signatureAlgorithm")}
                  </p>
                  <code className="bg-muted flex h-9 items-center rounded font-mono text-sm">
                    {credential.proof?.type ||
                      userData.credentialSignatureAlg ||
                      t("noSignatureType")}
                  </code>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">
                    {t("verificationMethod")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <code className="bg-muted flex-1 truncate rounded font-mono text-sm break-all">
                          {credential.proof?.verificationMethod ||
                            userData.credentialVerificationMethod ||
                            t("noVerificationMethod")}
                        </code>
                      </TooltipTrigger>
                      <TooltipContent>
                        {credential.proof?.verificationMethod ||
                          userData.credentialVerificationMethod ||
                          t("noVerificationMethod")}
                      </TooltipContent>
                    </Tooltip>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          credential.proof?.verificationMethod ||
                            userData.credentialVerificationMethod ||
                            "",
                          t("verificationMethod")
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">
                    {t("signatureValue")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <code className="bg-muted flex-1 truncate rounded font-mono text-sm break-all">
                          {credential.proof?.proofValue ||
                            userData.credentialSignatureValue ||
                            t("noSignatureValue")}
                        </code>
                      </TooltipTrigger>
                      <TooltipContent>
                        {credential.proof?.proofValue ||
                          userData.credentialSignatureValue ||
                          t("noSignatureValue")}
                      </TooltipContent>
                    </Tooltip>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          credential.proof?.proofValue ||
                            userData.credentialSignatureValue ||
                            "",
                          t("signatureValue")
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
        )}
      </div>
    );
  };

  if (!userDID) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="flex items-center gap-3 p-6">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <div>
            <h4 className="font-medium text-yellow-800">
              {t("userNotConfigured")}
            </h4>
            <p className="text-sm text-yellow-600">{t("userDidNotSet")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingUser) {
    return <LoadingDisplay title={t("loadingUser")} />;
  }

  if (userError) {
    return <ErrorDisplay error={userError} title={t("userLoadError")} />;
  }

  return (
    <Card className="border-border border">
      <CardHeader className="border-b border-gray-200 pb-6">
        <CardTitle>{t("userIdentity")}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {t("userDescription")}
        </CardDescription>
      </CardHeader>

      {/* 基本信息部分 */}
      <CardContent className="px-6">
        <div className="grid grid-cols-1 space-y-2 space-x-6 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              {t("didIdentifier")}
            </p>
            <div className="flex items-center gap-2">
              <code className="bg-muted flex-grow rounded-lg font-mono text-sm break-all">
                {userData?.userDid || userDID}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(
                    userData?.userDid || userDID,
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
              {t("userType")}
            </p>
            <div className="bg-muted flex h-9 items-center rounded-lg">
              <span className="font-medium">
                {userData?.userType || t("noUserType")}
              </span>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              {t("lastAuthTime")}
            </p>
            <div className="bg-muted rounded-lg">
              <span className="font-medium">
                {formatDateTime(userData?.lastAuthenticatedAt, {
                  fallback: t("noLastAuth"),
                })}
              </span>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              {t("identityStatus")}
            </p>
            <div className="bg-muted rounded-lg">
              <span className="flex items-center gap-1 font-medium text-green-600">
                <CheckCircle className="h-4 w-4" />
                {userData?.identityStatus || t("verified")}
              </span>
            </div>
          </div>

          {userData?.userName && (
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                {t("userName")}
              </p>
              <div className="bg-muted rounded-lg">
                <span className="font-medium">{userData.userName}</span>
              </div>
            </div>
          )}

          {userData?.organization && (
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                {t("organization")}
              </p>
              <div className="bg-muted rounded-lg">
                <span className="font-medium">{userData.organization}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Verifiable Credential子部分 */}
      <div className="border-t border-gray-100">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-6 pb-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="flex items-center gap-2 font-semibold">
              <FileText className="text-primary h-5 w-5" />
              <span>{t("verifiableCredential")}</span>
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("viewVcDetailContent")}
            </p>
          </div>

          {/* 视图切换按钮组 */}
          <div className="flex gap-2">
            <Button
              variant={vcViewMode === "visual" ? "default" : "outline"}
              size="sm"
              onClick={() => setVcViewMode("visual")}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant={vcViewMode === "json" ? "default" : "outline"}
              size="sm"
              onClick={() => setVcViewMode("json")}
              className="flex items-center gap-2"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-6">
          {vcViewMode === "visual" ? (
            <VCVisualView />
          ) : (
            <div className="space-y-4">
              <pre className="bg-muted overflow-x-auto rounded-lg p-6 font-mono text-sm leading-relaxed">
                {JSON.stringify(userData?.credential || {}, null, 2)}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(userData?.credential || {}, null, 2),
                    `${t("verifiableCredential")} JSON`
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
