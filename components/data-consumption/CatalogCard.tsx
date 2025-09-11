"use client";

import { EmptyState } from "@/components/shared/EmptyState";
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
import { useGetResourceListByDataspaceAndPublisher } from "@/lib/gen/hooks/useGetResourceListByDataspaceAndPublisher";
import { useAppStore } from "@/lib/stores/app-store";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  CheckCircle,
  Cloud,
  Database,
  File,
  Link,
  Pause,
  Server,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";

// Data source type icon mapping
const getDataSourceIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "local_file":
      return File;
    case "s3":
      return Cloud;
    case "nas":
      return Server;
    case "restful":
      return Link;
    default:
      return Database;
  }
};

// Data source type label mapping
const getDataSourceLabel = (type: string) => {
  switch (type?.toLowerCase()) {
    case "local_file":
      return "Local File";
    case "s3":
      return "S3 Storage";
    case "nas":
      return "NAS Storage";
    case "restful":
      return "RESTful API";
    default:
      return type || "Unknown";
  }
};

export function CatalogCard() {
  const { currentDataSpaceId, userDID } = useAppStore();

  // State for pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [allDataOfferings, setAllDataOfferings] = useState<any[]>([]);

  const {
    data: resourceData,
    isLoading: isLoadingResources,
    error: resourceError,
    refetch: refetchResources,
  } = useGetResourceListByDataspaceAndPublisher(
    {
      page,
      page_size: pageSize,
      dataspace: currentDataSpaceId || undefined,
      // publisher: userDID || "",
      // Do not pass publisher param to obtain all data
    },
    {
      query: {
        enabled: !!currentDataSpaceId,
      },
    }
  );

  // Reset page when dataspace changes
  useEffect(() => {
    setPage(1);
    setAllDataOfferings([]);
  }, [currentDataSpaceId]);

  // Handle data concatenation for "Load More" functionality
  useEffect(() => {
    if (resourceData?.data) {
      if (page === 1) {
        setAllDataOfferings(resourceData.data);
      } else {
        setAllDataOfferings((prev) => [...prev, ...resourceData.data]);
      }
    }
  }, [resourceData, page]);

  // Handle load more
  const handleLoadMore = () => {
    if (
      resourceData?.pagination?.total_page &&
      page < resourceData.pagination.total_page
    ) {
      setPage((prev) => prev + 1);
    }
  };

  // Check if there are more pages to load
  const hasMoreData =
    resourceData?.pagination?.total_page &&
    page < resourceData.pagination.total_page;

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  if (isLoadingResources && page === 1) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Catalog</CardTitle>
              <CardDescription>
                Discover and request data from other connectors
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 p-6">
            <Spinner variant="bars" />
            <p className="text-muted-foreground text-sm">
              Loading data catalog...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (resourceError) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Catalog</CardTitle>
              <CardDescription>
                Discover and request data from other connectors
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <p>Error loading data catalog</p>
            <Button
              onClick={() => refetchResources()}
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

  if (allDataOfferings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Catalog</CardTitle>
              <CardDescription>
                Discover and request data from other connectors
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Database}
            title="No data offerings found"
            description="No data offerings available for consumption"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Catalog</CardTitle>
            <CardDescription>
              Discover and request data from other connectors
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[480px] px-6 pb-6">
          <div className="space-y-3">
            {allDataOfferings.map((offering) => {
              const DataSourceIcon = getDataSourceIcon(offering.type);
              // Use simplified status since we don't have the complex status structure
              const isActive = offering.status === "Active";

              return (
                <div key={offering.id} className="rounded-lg border p-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <DataSourceIcon className="text-muted-foreground h-4 w-4" />
                      <h4 className="font-medium whitespace-nowrap">
                        {offering.title}
                      </h4>
                      {/* Status Badge */}
                      <div
                        className={cn(
                          "flex items-center space-x-1 rounded-md px-2 py-1 text-xs",
                          isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {isActive ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Pause className="h-3 w-3" />
                        )}
                        <span>{offering.status}</span>
                      </div>
                      {/* Bound Status Badge */}
                      <div
                        className={cn(
                          "flex items-center space-x-1 rounded-md px-2 py-1 text-xs",
                          offering.boundStatus === "APPROVED" &&
                            "bg-green-100 text-green-800",
                          offering.boundStatus === "PENDING" &&
                            "bg-yellow-100 text-yellow-800",
                          offering.boundStatus === "REJECTED" &&
                            "bg-red-100 text-red-800"
                        )}
                      >
                        <Shield className="h-3 w-3" />
                        <span>{offering.boundStatus || "N/A"}</span>
                      </div>
                      {/* Outbound/Inbound Badge */}
                      {offering.isOutbound !== undefined && (
                        <div
                          className={cn(
                            "flex items-center space-x-1 rounded-md px-2 py-1 text-xs",
                            offering.isOutbound
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          )}
                        >
                          <ArrowUpDown className="h-3 w-3" />
                          <span>
                            {offering.isOutbound ? "Outbound" : "Inbound"}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {offering.description}
                    </p>
                    <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <div className="flex items-center space-x-1">
                        <span>Type:</span>
                        <span className="font-medium">
                          {getDataSourceLabel(offering.type)}
                        </span>
                      </div>
                      {offering.config?.fileFormat && (
                        <div className="flex items-center space-x-1">
                          <span>Format:</span>
                          <span className="font-medium">
                            {offering.config.fileFormat}
                          </span>
                        </div>
                      )}
                      {offering.config?.fileSize && (
                        <div className="flex items-center space-x-1">
                          <span>Size:</span>
                          <span className="font-medium">
                            {formatFileSize(offering.config.fileSize)}
                          </span>
                        </div>
                      )}
                      {offering.originCountry && (
                        <div className="flex items-center space-x-1">
                          <span>Origin:</span>
                          <span className="font-medium">
                            {offering.originCountry}
                          </span>
                        </div>
                      )}
                      {offering.location && (
                        <div className="flex items-center space-x-1">
                          <span>Location:</span>
                          <span className="font-medium">
                            {offering.location}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <span>Created:</span>
                        <span>
                          {new Date(offering.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* 注意：这里没有Action Buttons部分，因为这是只读的数据目录 */}
                </div>
              );
            })}

            {/* Load More Button */}
            {hasMoreData && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  disabled={isLoadingResources}
                  className="w-full"
                >
                  {isLoadingResources ? (
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
