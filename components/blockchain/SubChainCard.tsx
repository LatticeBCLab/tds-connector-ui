"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModelsBlockChain, useGetBlockchain } from "@/lib/gen";
import { Folder, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "../shared/EmptyState";
import { Spinner } from "../ui/spinner";

interface SubChainCardProps {
  subChains: ModelsBlockChain[];
}

function SubChainRealCard({
  options,
}: {
  options: { label: string; value: string }[];
}) {
  const [id, setId] = useState(options[0].value);
  const { data: chainData, isLoading } = useGetBlockchain(+id);

  useEffect(() => {
    if (!options.find((d) => d.value === id)) {
      setId(options[0].value);
    }
  }, [id, options]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sub Chain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 p-6">
            <Spinner variant="bars" />
            <p className="text-muted-foreground text-sm">
              Loading sub chain...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    chainData && (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {chainData.name}
              </CardTitle>
              <CardDescription>{chainData.description}</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={id} onValueChange={setId}>
                <SelectTrigger className="bg-background border-border w-fit border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">{label}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{chainData.name}</h4>
                  <Badge variant="outline">ZLTC</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Chain Type:</span>
                    <p className="font-medium">Sub Chain</p>
                  </div>
                  {!!chainData.subChainType && (
                    <div>
                      <span className="text-muted-foreground">
                        Sub Chain Type:
                      </span>
                      <p className="font-medium">
                        {chainData.subChainType.charAt(0).toUpperCase() +
                          chainData.subChainType.slice(1)}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">
                      Active Transactions:
                    </span>
                    <p className="font-medium">
                      {chainData.recentTransactions?.length}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium">Connected</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Latest Block:</span>
                    <p className="font-medium">
                      {Math.floor(Math.random() * 1000000).toLocaleString()}
                    </p>
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

            {/* Sub Chain Recent Transactions */}
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

export function SubChainCard({ subChains }: SubChainCardProps) {
  if (subChains.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sub Chain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Folder}
            title="No sub chain found"
            description="No sub chain found"
          />
        </CardContent>
      </Card>
    );
  } else {
    const options = subChains.map((d) => ({
      value: d.id + "",
      label: d.name + "",
    }));
    return <SubChainRealCard options={options} />;
  }
}
