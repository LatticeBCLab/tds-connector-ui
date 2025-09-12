"use client";

import { ActionDialog, MetricCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDataOfferings } from "@/hooks";
import type { DataContract } from "@/types";
import { Activity, Database, ExternalLink, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { CatalogCard } from "./CatalogCard";
import { ConnectorCard } from "./ConnectorCard";
import { ContractCard } from "./ContractCard";

export function DataConsumptionTab() {
  const t = useTranslations("DataConsumption");
  const {
    dataRequests,
    dataContracts,
    externalOfferings,
    isRequestDataOpen,
    setIsRequestDataOpen,
    selectedOffering,
    setSelectedOffering,
    newRequest,
    setNewRequest,
    requestData,
  } = useDataOfferings();

  const activeContractsCount = dataContracts.filter(
    (c: DataContract) => c.status === "active" || c.status === "in_use"
  ).length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title={t("metrics.availableData")}
          value={externalOfferings.length}
          description={t("metrics.externalOfferings")}
          icon={Database}
          variant="primary"
        />
        <MetricCard
          title={t("metrics.activeContracts")}
          value={activeContractsCount}
          description={t("metrics.inUseActive")}
          icon={Activity}
          variant="secondary"
        />
        <MetricCard
          title={t("metrics.connectedPartners")}
          value={2}
          description={t("metrics.trustedConnectors")}
          icon={Users}
        />
        <MetricCard
          title={t("metrics.totalContracts")}
          value={dataContracts.length}
          description={t("metrics.allTime")}
          icon={ExternalLink}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Data Catalog */}
        <CatalogCard />

        {/* Data Contract */}
        <ContractCard />
      </div>

      {/* Connected Connectors */}
      <ConnectorCard />

      {/* Data Request Dialog */}
      <ActionDialog
        trigger={null}
        title={t("dialog.requestDataAccess")}
        description={
          selectedOffering
            ? `${t("dialog.requestAccessTo")} "${selectedOffering.title}" ${t("dialog.from")} ${selectedOffering.provider}`
            : undefined
        }
        open={isRequestDataOpen}
        onOpenChange={setIsRequestDataOpen}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-mode">{t("dialog.accessMode")}</Label>
            <Select
              value={newRequest.accessMode}
              onValueChange={(value: "api" | "download") =>
                setNewRequest({ ...newRequest, accessMode: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">{t("dialog.apiAccess")}</SelectItem>
                <SelectItem value="download">{t("dialog.download")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">{t("dialog.purpose")}</Label>
            <Textarea
              id="purpose"
              value={newRequest.purpose}
              onChange={(e) =>
                setNewRequest({ ...newRequest, purpose: e.target.value })
              }
              placeholder={t("dialog.purposePlaceholder")}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsRequestDataOpen(false)}
            >
              {t("dialog.cancel")}
            </Button>
            <Button onClick={requestData}>{t("dialog.submitRequest")}</Button>
          </div>
        </div>
      </ActionDialog>
    </div>
  );
}
