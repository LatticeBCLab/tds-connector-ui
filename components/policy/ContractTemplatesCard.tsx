"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useListContractTemplates,
  type ModelsContractTemplate,
} from "@/lib/gen";
import { Edit, Eye, FileText, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";

interface ContractTemplatesCardProps {
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  refreshTrigger?: number; // Used to trigger data refresh
}

export function ContractTemplatesCard({
  showCreateButton = true,
  onCreateClick,
  refreshTrigger,
}: ContractTemplatesCardProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [allTemplates, setAllTemplates] = useState<ModelsContractTemplate[]>(
    []
  );

  const {
    data,
    isLoading,
    error,
    refetch: refetchContracts,
  } = useListContractTemplates({
    page,
    page_size: pageSize,
  });

  // Accumulate templates list when data loads successfully
  useEffect(() => {
    if (data?.list) {
      if (page === 1) {
        // First page, set directly
        setAllTemplates(data.list);
      } else {
        // Subsequent pages, append to existing list
        setAllTemplates((prev) => [...prev, ...(data.list || [])]);
      }
    }
  }, [data, page]);

  const hasMoreData = data?.total ? allTemplates.length < data.total : false;

  const handleLoadMore = () => {
    if (!isLoading && hasMoreData) {
      setPage((prev) => prev + 1);
    }
  };

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      // Reset to first page and refetch data
      setPage(1);
      setAllTemplates([]);
      refetchContracts();
    }
  }, [refreshTrigger, refetchContracts]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
              <Skeleton className="mt-2 h-4 w-full" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="mt-4 h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <p>Error loading contract templates</p>
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

  if (!allTemplates || allTemplates.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No contract templates found"
        description="Create a new contract template to get started"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract Templates
            </CardTitle>
            <CardDescription>
              Pre-configured contracts combining multiple policies
            </CardDescription>
          </div>
          {showCreateButton && (
            <Button size="sm" variant="secondary" onClick={onCreateClick}>
              <Plus className="h-4 w-4" />
              Create Contract
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[480px] px-6 pb-6">
          <div className="space-y-4">
            {allTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{template.name}</h4>
                      <Badge
                        variant={
                          template.status === "active"
                            ? "default"
                            : template.status === "banned"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {template.status === "active"
                          ? "Active"
                          : template.status === "banned"
                            ? "Disabled"
                            : template.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-sm">
                      {template.description || "No description"}
                    </p>

                    <div className="flex items-center justify-end border-t pt-3">
                      <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <span>
                          Created:{" "}
                          {template.created_at
                            ? new Date(template.created_at).toLocaleDateString(
                                "en-US"
                              )
                            : "Unknown"}
                        </span>
                        {template.updated_at && (
                          <>
                            <span>•</span>
                            <span>
                              Updated:{" "}
                              {new Date(template.updated_at).toLocaleDateString(
                                "en-US"
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        {hasMoreData && !error && (
          <div className="border-t px-6 py-4 text-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Spinner variant="bars" className="mr-2 h-4 w-4" /> Loading...
                </>
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
