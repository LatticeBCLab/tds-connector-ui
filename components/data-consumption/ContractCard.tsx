"use client";

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
import { useGetContractListByDataspaceAndConsumer } from "@/lib/gen/hooks/useGetContractListByDataspaceAndConsumer";
import { useAppStore } from "@/lib/stores/app-store";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Globe,
  Loader2,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Get contract status based on expiration
const getContractDisplayStatus = (expiresAt: string) => {
  const now = new Date();
  const expiration = new Date(expiresAt);
  return now > expiration ? "Expired" : "Active";
};

export function ContractCard() {
  const { userDID, currentDataSpaceId } = useAppStore();

  // State for pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [allContracts, setAllContracts] = useState<any[]>([]);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(
    new Set()
  );

  const {
    data: contractData,
    isLoading: isLoadingContracts,
    error: contractError,
    refetch: refetchContracts,
  } = useGetContractListByDataspaceAndConsumer(
    currentDataSpaceId || "",
    {
      page,
      page_size: pageSize,
      consumer: userDID || "",
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

  // Check if there are more pages to load
  const hasMoreData =
    contractData?.pagination?.total_page &&
    page < contractData.pagination.total_page;

  // Handle file download
  const handleDownloadFile = async (contractId: string) => {
    setDownloadingFiles((prev) => new Set(prev).add(contractId));
    try {
      // Simulate download process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("File downloaded successfully");
    } catch (error) {
      toast.error("Failed to download file");
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(contractId);
        return newSet;
      });
    }
  };

  if (isLoadingContracts && page === 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Contract</CardTitle>
          <CardDescription>Manage your active data contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 p-6">
            <Spinner variant="bars" />
            <p className="text-muted-foreground text-sm">
              Loading data contracts...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contractError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Contract</CardTitle>
          <CardDescription>Manage your active data contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <p>Error loading data contracts</p>
            <Button
              onClick={() => refetchContracts()}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (allContracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Contract</CardTitle>
          <CardDescription>Manage your active data contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FileText}
            title="No data contracts found"
            description="You don't have any active data contracts"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Contract</CardTitle>
        <CardDescription>Manage your active data contracts</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[480px] px-6 pb-6">
          <div className="space-y-3">
            {allContracts.map((contract) => {
              const displayStatus = getContractDisplayStatus(
                contract.expiresAt
              );
              const isExpired = displayStatus === "Expired";
              const canTerminate = !isExpired;

              return (
                <div key={contract.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <FileText className="text-muted-foreground h-4 w-4" />
                        <h4 className="text-sm font-medium">{contract.name}</h4>
                        {/* Status Badge */}
                        <div
                          className={cn(
                            "flex items-center space-x-1 rounded-md px-2 py-1 text-xs",
                            isExpired
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          )}
                        >
                          {isExpired ? (
                            <Clock className="h-3 w-3" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          <span>{displayStatus}</span>
                        </div>
                      </div>
                      <div className="text-muted-foreground mb-1 flex items-center space-x-1 text-xs">
                        <Globe className="h-3 w-3" />
                        <span className="truncate">
                          Address: {contract.address}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* Download functionality based on policy type */}
                      {contract.policy?.some(
                        (p: any) => p.type === "download"
                      ) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Download Data"
                          onClick={() => handleDownloadFile(contract.id)}
                          disabled={downloadingFiles.has(contract.id)}
                        >
                          {downloadingFiles.has(contract.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {contract.policy?.some((p: any) => p.type === "api") && (
                        <Button variant="ghost" size="sm" title="API Access">
                          <Activity className="h-4 w-4" />
                        </Button>
                      )}
                      {canTerminate && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              title={
                                isExpired
                                  ? "Terminate Contract (Expired)"
                                  : "Terminate Contract"
                              }
                              className={isExpired ? "text-red-600" : ""}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirm Contract Termination
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {isExpired ? (
                                  <>
                                    This contract has expired:
                                    <div>
                                      • Contract expired on:{" "}
                                      {new Date(
                                        contract.expiresAt
                                      ).toLocaleDateString()}
                                    </div>
                                    <br />
                                    Are you sure you want to terminate this
                                    contract? This action cannot be undone.
                                  </>
                                ) : (
                                  "Are you sure you want to terminate this contract? This will stop all data access and cannot be undone."
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
                                  // TODO: Implement termination logic
                                  console.log(
                                    "Terminating contract:",
                                    contract.id
                                  );
                                  toast.success(
                                    "Contract terminated successfully"
                                  );
                                }}
                              >
                                {isExpired
                                  ? "Force Terminate"
                                  : "Confirm Terminate"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  {/* Contract Details */}
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
                          {contract.resourceId}
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

                  {/* Contract Information */}
                  <div className="mt-3 border-t pt-3">
                    <div className="grid grid-cols-2 gap-4 text-xs lg:grid-cols-4">
                      <div className="text-center">
                        <div className="text-muted-foreground">
                          Max Access Count
                        </div>
                        <div className="text-sm font-medium">
                          {contract.maxAccessCount || "Unlimited"}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Created</div>
                        <div className="text-sm font-medium">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Expires</div>
                        <div className="text-sm font-medium">
                          {new Date(contract.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Updated</div>
                        <div className="text-sm font-medium">
                          {new Date(contract.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning Information */}
                  {isExpired && (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2">
                      <div className="flex items-center space-x-2 text-xs text-red-800">
                        <AlertTriangle className="h-4 w-4" />
                        <div>
                          Contract has expired on{" "}
                          {new Date(contract.expiresAt).toLocaleDateString()}
                        </div>
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

