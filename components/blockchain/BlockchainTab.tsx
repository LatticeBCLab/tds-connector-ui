"use client";

import { MainChainCard } from "@/components/blockchain/MainChainCard";
import { SubChainCard } from "@/components/blockchain/SubChainCard";
import { MetricCard } from "@/components/shared";
import { useBlockchain } from "@/hooks";
import { useDataSpace } from "@/lib/contexts/DataSpaceContext";
import { Activity, Database, Network, Shield } from "lucide-react";
import { useState } from "react";

export function BlockchainTab() {
  const { blockchainNetworks, recentTransactions } = useBlockchain();

  const { currentDataSpace } = useDataSpace();

  // State for selected sub chain type
  const [selectedSubChainType, setSelectedSubChainType] = useState<
    "catalog" | "audit" | "business" | "lineage"
  >("catalog");

  // 分离主链和子链
  const mainChain = blockchainNetworks.find(
    (network) => network.chainType === "main"
  );
  const subChains = blockchainNetworks.filter(
    (network) => network.chainType === "sub"
  );

  // 分离主链和子链的交易
  const mainChainTransactions = recentTransactions.filter(
    (tx) => tx.chainType === "main"
  );
  const subChainTransactions = recentTransactions.filter(
    (tx) => tx.chainType === "sub" && tx.subChainType === selectedSubChainType
  );
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
          description={`${
            subChains.filter((s) => s.status === "connected").length
          } Connected`}
          icon={Database}
          variant="secondary"
        />
        <MetricCard
          title="Recent Transactions"
          value={recentTransactions.length}
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
        <MainChainCard
          mainChain={mainChain}
          mainChainTransactions={mainChainTransactions}
        />

        <SubChainCard
          selectedSubChainType={selectedSubChainType}
          onSubChainTypeChange={setSelectedSubChainType}
          subChainTransactions={subChainTransactions}
        />
      </div>
    </div>
  );
}
