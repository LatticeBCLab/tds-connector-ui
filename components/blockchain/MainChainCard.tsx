"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModelsBlockChain, useGetBlockchain } from "@/lib/gen";
import { LinkIcon, Shield } from "lucide-react";
import { EmptyState } from "../shared/EmptyState";

interface Transaction {
  id: string;
  type: string;
  hash: string;
  timestamp: string;
  status: "confirmed" | "failed" | "pending";
}

interface MainChainCardProps {
  mainChain?: ModelsBlockChain;
}

function MainChainRealCard({ id }: { id: number }) {
  const { data: chainData } = useGetBlockchain(id);

  return (
    chainData && (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Main Chain (Identity Chain)
              </CardTitle>
              <CardDescription>
                DID registration and identity verification
              </CardDescription>
            </div>
            {/* <StatusBadge status={mainChain?.status || "disconnected"} /> */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{chainData.name}</h4>
                  {/* <Badge variant="outline">{chainData.type}</Badge> */}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Chain ID:</span>
                    <p className="font-medium">{chainData.id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Consensus Nodes:
                    </span>
                    <p className="font-medium">{chainData.consensusNodes}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Block Height:</span>
                    <p className="font-medium">{chainData.height}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Purpose:</span>
                    <p className="font-medium">{chainData.purpose}</p>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-1 text-sm">{chainData.description}</p>
                </div>
              </div>
            </div>

            {/* Main Chain Recent Transactions */}
            <div>
              <h5 className="mb-3 font-medium">Recent Transactions</h5>
              <div className="space-y-2">
                {(chainData.recentTransactions || []).slice(0, 3).map((tx) => (
                  <div
                    key={tx.hash}
                    className="flex items-center justify-between rounded border p-2"
                  >
                    <div className="flex min-w-0 flex-1 items-center space-x-3">
                      <div className="text-muted-foreground truncate font-mono text-xs">
                        {tx.hash}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-muted-foreground text-xs">
                        {new Date(tx.timestamp!).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  );
}

export function MainChainCard({ mainChain }: MainChainCardProps) {
  if (!mainChain || !mainChain.id) {
    return (
      <EmptyState
        icon={LinkIcon}
        title="No main chain found"
        description="No main chain found"
      />
    );
  } else {
    return <MainChainRealCard id={mainChain.id} />;
  }
}
