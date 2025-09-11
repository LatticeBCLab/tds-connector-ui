"use client";

import { MainChainCard } from "@/components/blockchain/MainChainCard";
import { SubChainCard } from "@/components/blockchain/SubChainCard";
import { MetricCard } from "@/components/shared";
import { useDataSpace } from "@/lib/contexts/DataSpaceContext";
import { useGetBlockchainByDataSpace } from "@/lib/gen";
import { Activity, Database, Network, Shield } from "lucide-react";

export function BlockchainTab() {
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
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Main Chain"
          value={mainChain ? "Connected" : "Disconnected"}
          description="Identity Chain (DID)"
          icon={Shield}
          variant="primary"
        />
        <MetricCard
          title="Sub Chains"
          value={subChains.length}
          description={`${subChains.length} Connected`}
          icon={Database}
          variant="secondary"
        />
        <MetricCard
          title="Recent Transactions"
          value={"TODO"}
          description="Last 24 hours"
          icon={Activity}
        />
        <MetricCard
          title="Data Space"
          value={currentDataSpace?.name || "No data space"}
          description="Current environment"
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
