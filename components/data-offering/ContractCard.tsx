"use client";

import { DateTimePicker } from "@/components/DateTimePicker";
import { ActionDialog } from "@/components/shared";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useDataSpace } from "@/lib/contexts/DataSpaceContext";
import { useGetContractListByDataspaceAndProvider } from "@/lib/gen/hooks/useGetContractListByDataspaceAndProvider";
import { cn } from "@/lib/utils";
import { ContractStatus } from "@/types";
import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  Ban,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  Pause,
  Plus,
  Shield,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Contract status icon mapping
const getContractStatusIcon = (status: ContractStatus) => {
  switch (status) {
    case "active":
      return CheckCircle;
    case "transferring":
      return ArrowUpDown;
    case "in_use":
      return Activity;
    case "suspended":
      return Pause;
    case "expired":
      return Clock;
    case "data_unavailable":
      return WifiOff;
    case "violated":
      return Ban;
    default:
      return AlertTriangle;
  }
};

// Contract status label mapping
const getContractStatusLabel = (status: ContractStatus) => {
  switch (status) {
    case "active":
      return "Active";
    case "transferring":
      return "Transferring";
    case "in_use":
      return "In Use";
    case "suspended":
      return "Suspended";
    case "expired":
      return "Expired";
    case "data_unavailable":
      return "Data Unavailable";
    case "violated":
      return "Violated";
    default:
      return "Unknown";
  }
};

interface ContractCardProps {
  isAddContractOpen: boolean;
  setIsAddContractOpen: (open: boolean) => void;
  newContract: {
    name: string;
    contractAddress: string;
    providerDID: string;
    consumerDID: string;
    policy: string;
    maxAccessCount?: number;
    expiresAt?: string;
  };
  setNewContract: (contract: any) => void;
  createContract: () => Promise<void>;
}

export function ContractCard({
  isAddContractOpen,
  setIsAddContractOpen,
  newContract,
  setNewContract,
  createContract,
}: ContractCardProps) {
  const { currentDataSpace } = useDataSpace();

  // State for pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [allContracts, setAllContracts] = useState<any[]>([]);

  // API call for contracts
  const {
    data: contractData,
    isLoading: isLoadingContracts,
    error: contractError,
    refetch: refetchContracts,
  } = useGetContractListByDataspaceAndProvider(
    {
      page,
      page_size: pageSize,
      dataspace: currentDataSpace?.id,
    },
    {
      query: {
        enabled: !!currentDataSpace?.id,
      },
    }
  );

  // Reset page when dataspace changes
  useEffect(() => {
    setPage(1);
    setAllContracts([]);
  }, [currentDataSpace?.id]);

  // Handle data concatenation for "Load More" functionality
  useEffect(() => {
    if (contractData?.data) {
      if (page === 1) {
        setAllContracts(contractData.data);
      } else {
        setAllContracts((prev) => [...prev, ...contractData.data]);
      }
    }
  }, [contractData, page]);

  // Handle load more
  const handleLoadMore = () => {
    if (
      contractData?.pagination?.total_page &&
      page < contractData.pagination.total_page
    ) {
      setPage((prev) => prev + 1);
    }
  };

  // Check if there are more pages to load
  const hasMoreData =
    contractData?.pagination?.total_page &&
    page < contractData.pagination.total_page;

  // Determine contract status based on expiration
  const getContractDisplayStatus = (contract: any) => {
    const now = new Date();
    const expirationDate = new Date(contract.expiresAt);

    if (expirationDate < now) {
      return "expired";
    }
    return "active"; // Since the API doesn't provide status, we default to active for non-expired contracts
  };

  if (isLoadingContracts) {
    return cardSkeleton(
      <div className="flex flex-col items-center gap-3 p-6">
        <Spinner variant="bars" />
        <p className="text-muted-foreground text-sm">Loading contracts...</p>
      </div>
    );
  }

  if (contractError) {
    return cardSkeleton(
      <div className="p-6 text-center">
        <p>Error loading contracts</p>
        <Button
          onClick={() => refetchContracts()}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (allContracts.length === 0) {
    return cardSkeleton(
      <EmptyState
        icon={FileText}
        title="No contracts found"
        description="Create a new contract to get started"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Contract</CardTitle>
            <CardDescription>
              Show the data usage contract information
            </CardDescription>
          </div>
          <ActionDialog
            trigger={
              <Button size="sm" variant="secondary">
                <Plus className="h-4 w-4" />
                Add Contract
              </Button>
            }
            title="Create Data Contract"
            description="Add a new data usage contract"
            open={isAddContractOpen}
            onOpenChange={setIsAddContractOpen}
            maxWidth="md"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract-name">Contract Name</Label>
                <Input
                  id="contract-name"
                  className="border-border"
                  value={newContract.name}
                  onChange={(e) =>
                    setNewContract({
                      ...newContract,
                      name: e.target.value,
                    })
                  }
                  placeholder="Data Usage Contract - 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract-address">Contract Address</Label>
                <Input
                  id="contract-address"
                  className="border-border"
                  value={newContract.contractAddress}
                  onChange={(e) =>
                    setNewContract({
                      ...newContract,
                      contractAddress: e.target.value,
                    })
                  }
                  placeholder="0x1234abcd...ef56"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider-did">Provider DID</Label>
                  <Input
                    id="provider-did"
                    className="border-border"
                    value={newContract.providerDID}
                    onChange={(e) =>
                      setNewContract({
                        ...newContract,
                        providerDID: e.target.value,
                      })
                    }
                    placeholder="did:example:provider123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consumer-did">Consumer DID</Label>
                  <Input
                    id="consumer-did"
                    className="border-border"
                    value={newContract.consumerDID}
                    onChange={(e) =>
                      setNewContract({
                        ...newContract,
                        consumerDID: e.target.value,
                      })
                    }
                    placeholder="did:example:consumer456"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="policy">Access Policy</Label>
                <Select
                  value={newContract.policy}
                  onValueChange={(value) =>
                    setNewContract({ ...newContract, policy: value })
                  }
                >
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Restricted Access">
                      Restricted Access
                    </SelectItem>
                    <SelectItem value="Partner Only">Partner Only</SelectItem>
                    <SelectItem value="GDPR Compliance">
                      GDPR Compliance
                    </SelectItem>
                    <SelectItem value="Open Access">Open Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-access">Max Access Count</Label>
                  <Input
                    id="max-access"
                    type="number"
                    className="border-border"
                    value={newContract.maxAccessCount || ""}
                    onChange={(e) =>
                      setNewContract({
                        ...newContract,
                        maxAccessCount: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiration Date</Label>
                  <DateTimePicker
                    value={newContract.expiresAt}
                    onChange={(value) =>
                      setNewContract({
                        ...newContract,
                        expiresAt: value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddContractOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={createContract}>Create Contract</Button>
              </div>
            </div>
          </ActionDialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[480px] px-6 pb-6">
          <div className="space-y-3">
            {allContracts.map((contract) => {
              const displayStatus = getContractDisplayStatus(contract);
              const ContractStatusIcon = getContractStatusIcon(
                displayStatus as ContractStatus
              );
              const isExpired = new Date(contract.expiresAt) < new Date();
              const canSuspend = displayStatus === "active";

              return (
                <div key={contract.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <ContractStatusIcon className="text-muted-foreground h-4 w-4" />
                        <h4 className="text-sm font-medium">{contract.name}</h4>
                        <div
                          className={cn(
                            "flex items-center space-x-1 rounded-md px-2 py-1 text-xs",
                            displayStatus === "active" &&
                              "bg-green-100 text-green-800",
                            displayStatus === "expired" &&
                              "bg-orange-100 text-orange-800"
                          )}
                        >
                          <span>
                            {getContractStatusLabel(
                              displayStatus as ContractStatus
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {canSuspend && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              title={
                                isExpired
                                  ? "Suspend Contract (Expired)"
                                  : "Suspend Contract"
                              }
                              className={isExpired ? "text-red-600" : ""}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirm Contract Suspension
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {isExpired ? (
                                  <>
                                    Issues detected with this contract:
                                    <div>• Contract has expired</div>
                                    <br />
                                    Are you sure you want to suspend this
                                    contract? This action cannot be undone.
                                  </>
                                ) : (
                                  "Are you sure you want to suspend this contract? This will immediately stop data access and cannot be undone."
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className={
                                  isExpired ? "bg-red-600 hover:bg-red-700" : ""
                                }
                                onClick={() => {
                                  // TODO: Implement suspension logic
                                  console.log(
                                    "Suspending contract:",
                                    contract.id
                                  );
                                  toast.success(
                                    "Contract suspended successfully"
                                  );
                                }}
                              >
                                {isExpired
                                  ? "Force Suspend"
                                  : "Confirm Suspend"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  {/* Contract Address */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Contract Address:
                      </span>
                      <span className="text-muted-foreground ml-2 font-mono break-all">
                        {contract.address}
                      </span>
                    </div>
                  </div>

                  {/* Main Information */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Provider:</span>
                        <span className="ml-2 truncate font-mono">
                          {contract.provider}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Consumer:</span>
                        <span className="ml-2 truncate font-mono">
                          {contract.consumer}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Resource ID:
                        </span>
                        <span className="ml-2 truncate font-mono">
                          {contract.resourceId || "N/A"}
                        </span>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-2 text-sm">
                          Policies:
                        </div>
                        <div className="space-y-1">
                          {contract.policy.length === 0 ? (
                            <div className="text-muted-foreground text-sm">
                              No Policy
                            </div>
                          ) : (
                            contract.policy.map(
                              (policy: any, index: number) => (
                                <div
                                  key={policy.id || index}
                                  className="bg-muted/50 flex items-center gap-2 rounded py-1"
                                >
                                  <Shield className="text-primary h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    {policy.name}
                                  </span>
                                </div>
                              )
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Usage Statistics */}
                  <div className="mt-3 border-t pt-3">
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="text-center">
                        <div className="text-muted-foreground">Max Access</div>
                        <div className="text-sm font-medium">
                          {contract.maxAccessCount || "Unlimited"}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">
                          Created Date
                        </div>
                        <div className="text-sm font-medium">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">
                          Expiration Date
                        </div>
                        <div
                          className={cn(
                            "text-sm font-medium",
                            isExpired && "text-red-600"
                          )}
                        >
                          {new Date(contract.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning Information */}
                  {isExpired && (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2">
                      <div className="flex items-center space-x-2 text-xs text-red-800">
                        <AlertTriangle className="h-4 w-4" />
                        <div>Contract has expired</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Load More Button */}
            {hasMoreData && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  disabled={isLoadingContracts}
                  className="w-full"
                >
                  {isLoadingContracts ? (
                    <>
                      <Spinner variant="bars" className="mr-2 h-4 w-4" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function cardSkeleton(children: React.ReactNode) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Contract</CardTitle>
            <CardDescription>
              Show the data usage contract information
            </CardDescription>
          </div>
          <div>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Contract
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}