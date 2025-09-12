"use client";

import { SecurityRatingChart, StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetAllConnectorSecurityRatingsExclude } from "@/lib/gen/hooks/useGetAllConnectorSecurityRatingsExclude";
import type { ModelsConnectorSecurityRating } from "@/lib/gen/types/models/ConnectorSecurityRating";
import { cn } from "@/lib/utils";
import type { SecurityRating } from "@/types";
import { Calendar, Globe, Shield, Wifi } from "lucide-react";
import { useTranslations } from "next-intl";

// 安全等级颜色映射
const getSecurityLevelColor = (level?: string) => {
  switch (level) {
    case "S":
      return "bg-green-600";
    case "A":
      return "bg-green-500";
    case "B":
      return "bg-yellow-500";
    case "C":
      return "bg-orange-500";
    case "D":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

// 连接类型图标和文本映射
const getConnectionTypeDisplay = (t: any, type?: string) => {
  switch (type) {
    case "DEDICATED":
      return { icon: Wifi, text: t('connectors.dedicatedConnection'), color: "text-green-600" };
    case "INTERNET":
      return { icon: Globe, text: t('connectors.internetConnection'), color: "text-blue-600" };
    default:
      return { icon: Globe, text: t('connectors.unknownConnection'), color: "text-gray-600" };
  }
};

// 状态映射 - 基于安全等级推断状态
const getConnectorStatus = (level?: string) => {
  switch (level) {
    case "S":
    case "A":
      return "active";
    case "B":
      return "warning";
    case "C":
    case "D":
      return "error";
    default:
      return "inactive";
  }
};

// 从 DID 提取显示名称
const getDisplayNameFromDid = (t: any, did?: string) => {
  if (!did) return t('connectors.unknownConnector');
  const parts = did.split(":");
  if (parts.length >= 4) {
    return parts[parts.length - 1].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }
  return did;
};

// 证书解析
const parseCertifications = (certs?: string) => {
  if (!certs) return [];
  return certs.split(",").filter(cert => cert.trim());
};

interface ConnectorCardProps {
  excludeConnectorDid?: string;
}

export function ConnectorCard({ excludeConnectorDid }: ConnectorCardProps) {
  const t = useTranslations('DataConsumption');
  const { data: connectors = [], isLoading, error } = useGetAllConnectorSecurityRatingsExclude({
    exclude_connector_did: excludeConnectorDid,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('connectors.title')}</CardTitle>
          <CardDescription>
            {t('connectors.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">{t('connectors.loading')}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('connectors.title')}</CardTitle>
          <CardDescription>
            {t('connectors.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-500">{t('connectors.error')}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (connectors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('connectors.title')}</CardTitle>
          <CardDescription>
            {t('connectors.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">{t('connectors.noConnectors')}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('connectors.title')}</CardTitle>
        <CardDescription>
          {t('connectors.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {connectors.map((connector: ModelsConnectorSecurityRating) => {
            const displayName = getDisplayNameFromDid( t,connector.connectorDid);
            const connectionType = getConnectionTypeDisplay(t,connector.connectionType);
            const ConnectionIcon = connectionType.icon;
            const status = getConnectorStatus(connector.overallLevel);
            const certifications = parseCertifications(connector.thirdPartyCerts);

            return (
              <div
                key={connector.id}
                className="space-y-4 rounded-lg border p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center space-x-2">
                      <h4 className="text-lg font-semibold">
                        {displayName}
                      </h4>
                      <StatusBadge status={status} />
                    </div>
                    <div className="text-muted-foreground mb-1 flex items-center space-x-1 text-sm">
                      <ConnectionIcon className={cn("h-3 w-3", connectionType.color)} />
                      <span>{connectionType.text}</span>
                    </div>
                    <div className="text-muted-foreground mb-1 flex items-center space-x-1 text-sm">
                      <Shield className="h-3 w-3" />
                      <span>{connector.tlsVersion}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <SecurityRatingChart
                      assessment={{
                        overallScore: connector.overallScore || 0,
                        rating: (connector.overallLevel || "D") as SecurityRating,
                        lastAssessed: connector.updatedAt || new Date().toISOString(),
                        assessor: "System",
                        // 模拟六维度数据
                        dimensions: [
                          {
                            name: "Identity",
                            weight: 0.17,
                            score: 0.85,
                            status: connector.identityColor?.toLowerCase() === "green" ? "green" : 
                                   connector.identityColor?.toLowerCase() === "yellow" ? "yellow" : "red",
                            description: "Identity verification and management"
                          },
                          {
                            name: "Communication",
                            weight: 0.17,
                            score: 0.90,
                            status: connector.commColor?.toLowerCase() === "green" ? "green" : 
                                   connector.commColor?.toLowerCase() === "yellow" ? "yellow" : "red",
                            description: "Secure communication protocols"
                          },
                          {
                            name: "Access Control",
                            weight: 0.17,
                            score: 0.88,
                            status: connector.accessUsageColor?.toLowerCase() === "green" ? "green" : 
                                   connector.accessUsageColor?.toLowerCase() === "yellow" ? "yellow" : "red",
                            description: "Access control and data usage policies"
                          },
                          {
                            name: "Platform Security",
                            weight: 0.17,
                            score: 0.82,
                            status: connector.platformColor?.toLowerCase() === "green" ? "green" : 
                                   connector.platformColor?.toLowerCase() === "yellow" ? "yellow" : "red",
                            description: "Platform and system security"
                          },
                          {
                            name: "Audit & Traceability",
                            weight: 0.16,
                            score: 0.87,
                            status: connector.auditColor?.toLowerCase() === "green" ? "green" : 
                                   connector.auditColor?.toLowerCase() === "yellow" ? "yellow" : "red",
                            description: "Audit logging and traceability"
                          },
                          {
                            name: "Privacy",
                            weight: 0.16,
                            score: 0.91,
                            status: connector.privacyColor?.toLowerCase() === "green" ? "green" : 
                                   connector.privacyColor?.toLowerCase() === "yellow" ? "yellow" : "red",
                            description: "Privacy protection and compliance"
                          }
                        ],
                      }}
                      size="md"
                      showModal={true}
                    />
                    <Badge
                      className={cn(
                        "text-xs text-white",
                        getSecurityLevelColor(connector.overallLevel)
                      )}
                    >
                      {t('connectors.securityRating')} {connector.overallLevel || t('catalog.notAvailable')}
                    </Badge>
                  </div>
                </div>

                {/* DID */}
                <div className="bg-muted rounded-md">
                  <div className="text-muted-foreground mb-1 text-xs">{t('connectors.did')}:</div>
                  <p className="font-mono text-sm break-all">{connector.connectorDid}</p>
                </div>

                {/* Security Features */}
                <div className="space-y-2">
                  <div className="text-muted-foreground text-xs">{t('connectors.securityFeatures')}:</div>
                  <div className="flex flex-wrap gap-1">
                    {connector.msgSigning && (
                      <Badge variant="secondary" className="text-xs">
                        {t('connectors.messageSigning')}
                      </Badge>
                    )}
                    {connector.mfaEnabled && (
                      <Badge variant="secondary" className="text-xs">
                        {t('connectors.mfaEnabled')}
                      </Badge>
                    )}
                    {connector.hsmTpm && (
                      <Badge variant="secondary" className="text-xs">
                        {t('connectors.hsmTpm')}
                      </Badge>
                    )}
                    {connector.didEnabled && (
                      <Badge variant="secondary" className="text-xs">
                        {t('connectors.didEnabled')}
                      </Badge>
                    )}
                    {connector.usageControlEnforced && (
                      <Badge variant="secondary" className="text-xs">
                        {t('connectors.usageControl')}
                      </Badge>
                    )}
                    {connector.secureBoot && (
                      <Badge variant="secondary" className="text-xs">
                        {t('connectors.secureBoot')}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Certifications */}
                {certifications.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-muted-foreground text-xs">{t('connectors.certifications')}:</div>
                    <div className="flex flex-wrap gap-1">
                      {certifications.map((cert, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          <Shield className="size-3" />
                          {cert.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-3">
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {connector.overallScore?.toFixed(1) || t('catalog.notAvailable')}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {t('connectors.score')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {connector.logRetentionMonths || t('catalog.notAvailable')}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {t('connectors.logRetention')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {connector.createdAt ? new Date(connector.createdAt).toLocaleDateString() : t('catalog.notAvailable')}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {t('catalog.created')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <div className="text-sm font-medium">
                        {connector.updatedAt ? new Date(connector.updatedAt).toLocaleDateString() : t('catalog.notAvailable')}
                      </div>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {t('connectors.securityReview')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
