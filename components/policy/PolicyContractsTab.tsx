"use client";

import { MetricCard } from "@/components/shared";
import { useDataSpace } from "@/lib/contexts/DataSpaceContext";
import { useGetContractTemplateStatistic } from "@/lib/gen";
import { useListPolicies } from "@/lib/gen/hooks/useListPolicies";
import { CheckCircle, FileText, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ContractTemplatesCard } from "./ContractTemplatesCard";
import { CreateContractTemplateDialog } from "./CreateContractTemplateDialog";
import { PolicyTemplatesCard } from "./PolicyTemplatesCard";

export function PolicyContractsTab() {
  const t = useTranslations("Policy");
  const { currentDataSpace } = useDataSpace();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCreateContractTemplateOpen, setIsCreateContractTemplateOpen] =
    useState(false);
  const { data: statisticData } = useGetContractTemplateStatistic({
    dataspace_id: currentDataSpace?.id || "",
  });
  // 获取策略数据
  const { data: policiesResponse } = useListPolicies({
    page: 1,
    page_size: 1, // 只需要获取总数
  });

  const totalPolicies = (policiesResponse as any)?.total || 0;

  const handleContractTemplateCreated = () => {
    // Trigger refresh of contract templates list
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title={t("activePolicyTemplates")}
          value={totalPolicies}
          description={t("currentlyAvailable")}
          icon={Shield}
          variant="primary"
        />
        <MetricCard
          title={t("contractTemplates")}
          value={statisticData?.total_count || ""}
          description={t("readyToUse")}
          icon={FileText}
          variant="secondary"
        />
        <MetricCard
          title={t("activeContractTemplates")}
          value={statisticData?.active_count || ""}
          description={t("currentlyEnforced")}
          icon={CheckCircle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Policy Templates */}
        <PolicyTemplatesCard />

        {/* Contract Templates */}
        <ContractTemplatesCard
          onCreateClick={() => setIsCreateContractTemplateOpen(true)}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Create Contract Template Dialog */}
      <CreateContractTemplateDialog
        open={isCreateContractTemplateOpen}
        onOpenChange={setIsCreateContractTemplateOpen}
        onSuccess={handleContractTemplateCreated}
      />
    </div>
  );
}
