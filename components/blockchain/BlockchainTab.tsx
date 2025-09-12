"use client";

import { MainChainCard } from "@/components/blockchain/MainChainCard";
import { SubChainCard } from "@/components/blockchain/SubChainCard";
import { MetricCard } from "@/components/shared";
import { useDataSpace } from "@/lib/contexts/DataSpaceContext";
import { useGetBlockchainByDataSpace } from "@/lib/gen";
import { Database, Network, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

export function BlockchainTab() {
  const t = useTranslations("Settings.blockchain");
  const { currentDataSpace } = useDataSpace();

  const { data: blockchainNetworks = [] } = useGetBlockchainByDataSpace(
    currentDataSpace?.id || ""
  );

  // 分离主链和子链
  const mainChain = blockchainNetworks.find((network) => network.isMainChain);
  const subChains = blockchainNetworks.filter(
    (network) => !network.isMainChain
  );

  // 分离主链和子链的交易
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title={t("mainChain")}
          value={mainChain ? t("connected") : t("disconnected")}
          description={t("identityChain")}
          icon={Shield}
          variant="primary"
        />
        <MetricCard
          title={t("subChains")}
          value={subChains.length}
          description={`${subChains.length} ${t("connected")}`}
          icon={Database}
          variant="secondary"
        />
        <MetricCard
          title={t("dataSpace")}
          value={currentDataSpace?.name || t("noDataSpace")}
          description={t("currentEnvironment")}
          icon={Network}
        />
      </div>

      {/* Main Chain and Sub Chain Display */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MainChainCard mainChain={mainChain} />
        <SubChainCard subChains={subChains} />
      </div>
    </div>
  );
}
