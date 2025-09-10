"use client";

import { StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  LinkIcon,
  Shield,
} from "lucide-react";
import { EmptyState } from "../shared/EmptyState";

interface MainChain {
  name: string;
  type: string;
  chainId: number;
  curveAlgorithm: string;
  witnessNodes: number;
  consensusNodes: number;
  blockHeight: number;
  purpose: string;
  description: string;
  status: string;
}

interface Transaction {
  id: string;
  type: string;
  hash: string;
  timestamp: string;
  status: "confirmed" | "failed" | "pending";
}

interface MainChainCardProps {
  mainChain?: MainChain;
  mainChainTransactions: Transaction[];
}

export function MainChainCard({
  mainChain,
  mainChainTransactions,
}: MainChainCardProps) {
  if (!mainChain) {
    return (
      <EmptyState
        icon={LinkIcon}
        title="No main chain found"
        description="No main chain found"
      />
    );
  }
  return (
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
          <StatusBadge status={mainChain?.status || "disconnected"} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{mainChain.name}</h4>
                <Badge variant="outline">{mainChain.type}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Chain ID:</span>
                  <p className="font-medium">{mainChain.chainId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Curve Algorithm:
                  </span>
                  <p className="font-medium">{mainChain.curveAlgorithm}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Witness Nodes:</span>
                  <p className="font-medium">{mainChain.witnessNodes}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Consensus Nodes:
                  </span>
                  <p className="font-medium">{mainChain.consensusNodes}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Block Height:</span>
                  <p className="font-medium">
                    {mainChain.blockHeight.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Purpose:</span>
                  <p className="font-medium">{mainChain.purpose}</p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Description:</span>
                <p className="mt-1 text-sm">{mainChain.description}</p>
              </div>
            </div>
          </div>

          {/* Main Chain Recent Transactions */}
          <div>
            <h5 className="mb-3 font-medium">Recent Transactions</h5>
            <div className="space-y-2">
              {mainChainTransactions.slice(0, 3).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded border p-2"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {tx.status === "confirmed" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : tx.status === "failed" ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-sm font-medium">
                        {tx.type.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground font-mono text-xs">
                      {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
