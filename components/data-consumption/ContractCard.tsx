"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { useTranslations } from "next-intl";
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
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useCreateResource } from "@/lib/gen/hooks/useCreateResource";
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
const getContractDisplayStatus = (expiresAt: string, t: any) => {
  const now = new Date();
  const expiration = new Date(expiresAt);
  return now > expiration ? t('contracts.expired') : t('contracts.active');
};

export function ContractCard() {
  const t = useTranslations('DataConsumption');
  const { userDID, currentDataSpaceId } = useAppStore();

  // Initialize mutation hooks
  const createResourceMutation = useCreateResource();

  // State for pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [allContracts, setAllContracts] = useState<any[]>([]);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(
    new Set()
  );
  const [downloadProgress, setDownloadProgress] = useState<{
    [key: string]: number;
  }>({});

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
    // Find the contract to get the resourceId
    const contract = allContracts.find((c) => c.id === contractId);
    if (!contract || !contract.resourceId) {
      toast.error("Contract or resource not found");
      return;
    }

    setDownloadingFiles((prev) => new Set(prev).add(contractId));
    setDownloadProgress((prev) => ({ ...prev, [contractId]: 0 }));

    try {
      // Step 1: Preparing download
      await new Promise((resolve) => setTimeout(resolve, 800));
      setDownloadProgress((prev) => ({ ...prev, [contractId]: 15 }));

      // Step 2: Get original resource details using the hook (manual call)
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setDownloadProgress((prev) => ({ ...prev, [contractId]: 30 }));

      // We'll use a client-side import to call the function directly
      const { getResourceByID } = await import(
        "@/lib/gen/clients/getResourceByID"
      );
      const resourceData = await getResourceByID(contract.resourceId);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDownloadProgress((prev) => ({ ...prev, [contractId]: 50 }));

      console.log(resourceData);

      // Step 3: Processing data
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setDownloadProgress((prev) => ({ ...prev, [contractId]: 65 }));

      // Step 4: Create new resource with downloaded data
      const newResourceData = {
        config: resourceData.config,
        dataspace: process.env.NEXT_PUBLIC_INBOUND_RESOURCE_DATASPACE_ID,
        description: resourceData.description,
        location: process.env.NEXT_PUBLIC_LOCATION,
        originCountry: resourceData.originCountry,
        //originResource: [contract.resourceId],
        publisher: process.env.NEXT_PUBLIC_USER_DID || "",
        status: "Active" as any,
        title: resourceData.title || "",
        type: resourceData.type || ("S3" as any),
      };

      await new Promise((resolve) => setTimeout(resolve, 1200));
      setDownloadProgress((prev) => ({ ...prev, [contractId]: 80 }));

      await createResourceMutation.mutateAsync({
        data: newResourceData as any,
      });

      await new Promise((resolve) => setTimeout(resolve, 800));
      setDownloadProgress((prev) => ({ ...prev, [contractId]: 95 }));

      // Step 5: Finalizing download
      await new Promise((resolve) => setTimeout(resolve, 600));
      setDownloadProgress((prev) => ({ ...prev, [contractId]: 100 }));

      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Data downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download data");
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(contractId);
        return newSet;
      });
      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[contractId];
        return newProgress;
      });
    }
  };

  if (isLoadingContracts && page === 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('contracts.title')}</CardTitle>
          <CardDescription>{t('contracts.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 p-6">
            <Spinner variant="bars" />
            <p className="text-muted-foreground text-sm">
              {t('contracts.loading')}
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
          <CardTitle>{t('contracts.title')}</CardTitle>
          <CardDescription>{t('contracts.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <p>{t('contracts.error')}</p>
            <Button
              onClick={() => refetchContracts()}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              {t('common.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('contracts.title')}</CardTitle>
        <CardDescription>{t('contracts.description')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {allContracts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t('contracts.noContracts')}
            description={t('contracts.noContractsDescription')}
          />
        ) : (
          <ScrollArea className="h-[480px] px-6 pb-6">
            <div className="space-y-3">
              {allContracts.map((contract) => {
                const displayStatus = getContractDisplayStatus(
                  contract.expiresAt,
                  t
                );
                const isExpired = displayStatus === "Expired";
                const canTerminate = !isExpired;

                return (
                  <div key={contract.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center space-x-2">
                          <FileText className="text-muted-foreground h-4 w-4" />
                          <h4 className="text-sm font-medium">
                            {contract.name}
                          </h4>
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
                            {t('contracts.address')}: {contract.address}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" title={t('contracts.viewDetails')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title={t('contracts.downloadData')}
                          onClick={() => handleDownloadFile(contract.id)}
                          disabled={downloadingFiles.has(contract.id)}
                        >
                          {downloadingFiles.has(contract.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        {contract.policy?.some(
                          (p: any) => p.type === "api"
                        ) && (
                          <Button variant="ghost" size="sm" title={t('contracts.apiAccess')}>
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
                                    ? t('contracts.terminateExpired')
                                    : t('contracts.terminate')
                                }
                                className={isExpired ? "text-red-600" : ""}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t('contracts.confirmTermination')}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {isExpired ? (
                                    <>
                                      {t('contracts.expiredMessage')}
                                      <div>
                                        • {t('contracts.expiredOn')}{" "}
                                        {new Date(
                                          contract.expiresAt
                                        ).toLocaleDateString()}
                                      </div>
                                      <br />
                                      {t('contracts.terminateConfirmMessage')}
                                    </>
                                  ) : (
                                    t('contracts.terminateWarning')
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  className={
                                    isExpired
                                      ? "bg-red-600 hover:bg-red-700"
                                      : ""
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
                                    ? t('contracts.forceTerminate')
                                    : t('contracts.confirmTerminate')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>

                    {/* Download Progress */}
                    {downloadingFiles.has(contract.id) &&
                      downloadProgress[contract.id] !== undefined && (
                        <div className="my-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {t('contracts.downloadingData')}
                            </span>
                            <span className="text-muted-foreground">
                              {downloadProgress[contract.id]}%
                            </span>
                          </div>
                          <Progress
                            value={downloadProgress[contract.id]}
                            className="h-2"
                          />
                        </div>
                      )}

                    {/* Contract Details */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t('contracts.provider')}:
                          </span>
                          <span className="ml-2 truncate font-mono">
                            {contract.provider}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t('contracts.consumer')}:
                          </span>
                          <span className="ml-2 truncate font-mono">
                            {contract.consumer}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t('contracts.resourceId')}:
                          </span>
                          <span className="ml-2 truncate font-mono">
                            {contract.resourceId}
                          </span>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-2 text-sm">
                            {t('contracts.policies')}:
                          </div>
                          <div className="space-y-1">
                            {contract.policy.length === 0 ? (
                              <div className="text-muted-foreground text-sm">
                                {t('contracts.noPolicy')}
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
                            {t('contracts.maxAccessCount')}
                          </div>
                          <div className="text-sm font-medium">
                            {contract.maxAccessCount || t('contracts.unlimited')}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">{t('contracts.created')}</div>
                          <div className="text-sm font-medium">
                            {new Date(contract.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">{t('contracts.expires')}</div>
                          <div className="text-sm font-medium">
                            {new Date(contract.expiresAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">{t('contracts.updated')}</div>
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
                            {t('contracts.contractExpiredOn')}{" "}
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
                        {t('common.loading')}
                      </>
                    ) : (
                      t('common.loadMore')
                    )}
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

