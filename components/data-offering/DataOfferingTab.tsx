"use client";

import { ContractCard } from "@/components/data-offering/ContractCard";
import { OfferingsCard } from "@/components/data-offering/OfferingsCard";
import { MetricCard } from "@/components/shared";
import { useDataOfferings } from "@/hooks";
import { useDataSpace } from "@/lib/contexts/DataSpaceContext";
import { useGetActiveResourceCountByDataspace } from "@/lib/gen/hooks/useGetActiveResourceCountByDataspace";
import { useGetContractCountByDataspaceAndProvider } from "@/lib/gen/hooks/useGetContractCountByDataspaceAndProvider";
import { useGetTotalResourceCountByDataspace } from "@/lib/gen/hooks/useGetTotalResourceCountByDataspace";
import { Database, FileText, Globe } from "lucide-react";
import { useTranslations } from "next-intl";

export function DataOfferingTab() {
  const t = useTranslations("DataOffering");
  const { currentDataSpace } = useDataSpace();

  const {
    isAddOfferingOpen,
    setIsAddOfferingOpen,
    isAddContractOpen,
    setIsAddContractOpen,
  } = useDataOfferings();

  // API calls for metrics
  const { data: activeResourceCount } = useGetActiveResourceCountByDataspace(
    currentDataSpace?.id || "",
    undefined,
    { query: { enabled: !!currentDataSpace?.id } }
  );

  const { data: contractCount } = useGetContractCountByDataspaceAndProvider(
    currentDataSpace?.id || "",
    undefined,
    { query: { enabled: !!currentDataSpace?.id } }
  );

  const { data: totalResourceCount } = useGetTotalResourceCountByDataspace(
    currentDataSpace?.id || "",
    undefined,
    {
      query: { enabled: !!currentDataSpace?.id },
    }
  );

  const activeOfferingsCount = activeResourceCount?.count ?? 0;
  const dataContractsCount = contractCount?.count ?? 0;
  const totalOfferingsCount = totalResourceCount?.count ?? 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title={t("metrics.activeOfferings.title")}
          value={activeOfferingsCount}
          description={t("metrics.activeOfferings.description")}
          icon={Database}
          variant="primary"
        />
        <MetricCard
          title={t("metrics.dataContracts.title")}
          value={dataContractsCount}
          description={t("metrics.dataContracts.description")}
          icon={FileText}
          variant="secondary"
        />
        <MetricCard
          title={t("metrics.totalOfferings.title")}
          value={totalOfferingsCount}
          description={t("metrics.totalOfferings.description")}
          icon={Globe}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Data Offerings Management */}
        <OfferingsCard
          isAddOfferingOpen={isAddOfferingOpen}
          setIsAddOfferingOpen={setIsAddOfferingOpen}
        />

        {/* Data Contract Management */}
        <ContractCard
          isAddContractOpen={isAddContractOpen}
          setIsAddContractOpen={setIsAddContractOpen}
        />
      </div>
    </div>
  );
}
