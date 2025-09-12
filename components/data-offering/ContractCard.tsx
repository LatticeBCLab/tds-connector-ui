"use client";

import { CreateContractDialog } from "@/components/data-offering/CreateContractDialog";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useGetContractListByProviderAndFromDataSpace } from "@/lib/gen";
import { useAppStore } from "@/lib/stores/app-store";
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
import { useTranslations } from "next-intl";
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
const getContractStatusLabel = (status: ContractStatus, t: any) => {
  switch (status) {
    case "active":
      return t("contract.status.active");
    case "transferring":
      return t("contract.status.transferring");
    case "in_use":
      return t("contract.status.in_use");
    case "suspended":
      return t("contract.status.suspended");
    case "expired":
      return t("contract.status.expired");
    case "data_unavailable":
      return t("contract.status.data_unavailable");
    case "violated":
      return t("contract.status.violated");
    default:
      return t("contract.status.unknown");
  }
};

interface ContractCardProps {
  isAddContractOpen: boolean;
  setIsAddContractOpen: (open: boolean) => void;
}

export function ContractCard({
  isAddContractOpen,
  setIsAddContractOpen,
}: ContractCardProps) {
  const t = useTranslations("DataOffering");
  const { userDID, currentDataSpaceId } = useAppStore();

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
  } = useGetContractListByProviderAndFromDataSpace(
    {
      page,
      page_size: pageSize,
      provider: userDID || "",
      from_data_space_id: currentDataSpaceId || "",
      from_connect_did: process.env.NEXT_PUBLIC_CONNECTOR_DID || "",
    },
    {
      query: {
        enabled: !!currentDataSpaceId && !!userDID,
      },
    }
  );

  // Reset page when dataspace changes
  useEffect(() => {
    setPage(1);
    setAllContracts([]);
  }, [currentDataSpaceId]);

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

  // Handle refresh data after creating new contract
  const handleRefreshData = () => {
    setPage(1);
    setAllContracts([]);
    refetchContracts();
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
    return (
      <CardSkeleton>
        <div className="flex flex-col items-center gap-3 p-6">
          <Spinner variant="bars" />
          <p className="text-muted-foreground text-sm">
            {t("contract.loading")}
          </p>
        </div>
      </CardSkeleton>
    );
  }

  if (contractError) {
    return (
      <CardSkeleton>
        <div className="p-6 text-center">
          <p>{t("contract.error")}</p>
          <Button
            onClick={() => refetchContracts()}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            {t("common.retry")}
          </Button>
        </div>
      </CardSkeleton>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("contract.title")}</CardTitle>
            <CardDescription>{t("contract.description")}</CardDescription>
          </div>
          <CreateContractDialog
            open={isAddContractOpen}
            onOpenChange={setIsAddContractOpen}
            onSuccess={handleRefreshData}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[480px] px-6 pb-6">
          {allContracts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t("contract.empty.title")}
              description={t("contract.empty.description")}
            />
          ) : (
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
                          <h4 className="text-sm font-medium">
                            {contract.name}
                          </h4>
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
                                displayStatus as ContractStatus,
                                t
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
                                  {t("contract.suspend.title")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {isExpired ? (
                                    <>
                                      {t("contract.suspend.issuesDetected")}:
                                      <div>
                                        •{" "}
                                        {t("contract.suspend.contractExpired")}
                                      </div>
                                      <br />
                                      {t("contract.suspend.confirmExpired")}
                                    </>
                                  ) : (
                                    t("contract.suspend.description")
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("common.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className={
                                    isExpired
                                      ? "bg-red-600 hover:bg-red-700"
                                      : ""
                                  }
                                  onClick={() => {
                                    // TODO: Implement suspension logic
                                    console.log(
                                      "Suspending contract:",
                                      contract.id
                                    );
                                    toast.success(
                                      t("contract.suspend.success")
                                    );
                                  }}
                                >
                                  {isExpired
                                    ? t("contract.suspend.forceSuspend")
                                    : t("contract.suspend.confirm")}
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
                          {t("contract.fields.contractAddress")}:
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
                          <span className="text-muted-foreground">
                            {t("contract.fields.provider")}:
                          </span>
                          <span className="ml-2 truncate font-mono">
                            {contract.provider}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t("contract.fields.consumer")}:
                          </span>
                          <span className="ml-2 truncate font-mono">
                            {contract.consumer}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t("contract.fields.resourceId")}:
                          </span>
                          <span className="ml-2 truncate font-mono">
                            {contract.resourceId || "N/A"}
                          </span>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-2 text-sm">
                            {t("contract.fields.policies")}:
                          </div>
                          <div className="space-y-1">
                            {contract.policy.length === 0 ? (
                              <div className="text-muted-foreground text-sm">
                                {t("contract.fields.noPolicy")}
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
                          <div className="text-muted-foreground">
                            {t("contract.fields.maxAccess")}
                          </div>
                          <div className="text-sm font-medium">
                            {contract.maxAccessCount ||
                              t("contract.fields.unlimited")}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">
                            {t("contract.fields.createdDate")}
                          </div>
                          <div className="text-sm font-medium">
                            {new Date(contract.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">
                            {t("contract.fields.expirationDate")}
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
                          <div>{t("contract.warning.expired")}</div>
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
                        {t("common.loading")}
                      </>
                    ) : (
                      t("common.loadMore")
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function CardSkeleton({ children }: { children: React.ReactNode }) {
  const t = useTranslations("DataOffering");
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("contract.title")}</CardTitle>
            <CardDescription>{t("contract.description")}</CardDescription>
          </div>
          <div>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              {t("contract.addContract")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}