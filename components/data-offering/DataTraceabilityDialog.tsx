"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useGetResourceByID } from "@/lib/gen/hooks/useGetResourceByID";
import { useGetTracesByResourceID } from "@/lib/gen/hooks/useGetTracesByResourceID";

import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import { cn } from "@/lib/utils";
import {
  Database,
  FileText,
  GitBranch,
  GitCompare,
  GitFork,
  GitMerge,
  IdCard,
  MapPin,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

interface DataTraceabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: string;
}

export function DataTraceabilityDialog({
  open,
  onOpenChange,
  resourceId,
}: DataTraceabilityDialogProps) {
  const t = useTranslations("dataTraceabilityDialog");
  const {
    data: resourceData,
    isLoading,
    error,
  } = useGetResourceByID(resourceId, {
    query: {
      enabled: open && !!resourceId,
    },
  });
  const {
    data: traceData,
    isLoading: isLoadingTrace,
    error: loadTraceFailed,
  } = useGetTracesByResourceID(resourceId, undefined, {
    query: {
      enabled: open && !!resourceId,
    },
  });

  // 根据资源类型获取图标
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "S3":
        return Database;
      case "merge":
        return GitMerge;
      case "fork":
        return GitFork;
      case "compare":
        return GitCompare;
      default:
        return FileText;
    }
  };

  // 构建溯源时间线数据
  const timelineItems = useMemo(() => {
    if (!resourceData) return [];

    const items: TimelineItemData[] = [];

    // 处理完整的溯源链路
    if (traceData?.data && traceData.data.length > 0) {
      // 遍历 traceData.data 数组，每个元素的 resource 都是溯源链路中的一个节点
      traceData.data.forEach((traceItem: any, index: number) => {
        const resource = traceItem.resource;
        if (resource) {
          items.push({
            id: resource.id || "",
            title: resource.title || t("unknownResource"),
            description: resource.description || "",
            type: resource.type?.toString() || t("unknown"),
            status: resource.status?.toString() || t("unknown"),
            createdAt: resource.created_at || "",
            publisher: resource.publisher || "",
            location: resource.location?.toString() || "",
            icon: getResourceIcon(resource.type?.toString() || ""),
            isCompleted: resource.status?.toString() === "Active",
          });
        }
      });
    } else {
      // 如果没有溯源数据，则显示当前资源
      items.push({
        id: resourceData.id || "",
        title: resourceData.title || t("unknownResource"),
        description: resourceData.description || "",
        type: resourceData.type?.toString() || t("unknown"),
        status: resourceData.status?.toString() || t("unknown"),
        createdAt: resourceData.createdAt || "",
        publisher: resourceData.publisher || "",
        location: resourceData.location?.toString() || "",
        icon: getResourceIcon(resourceData.type?.toString() || ""),
        isCompleted: resourceData.status?.toString() === "Active",
      });
    }

    return items;
  }, [resourceData, traceData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5" />
            <span>{t("title")}</span>
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {(isLoading || isLoadingTrace) && (
            <div className="flex flex-col items-center gap-3 p-8">
              <Spinner variant="bars" />
              <p className="text-muted-foreground text-sm">{t("loading")}</p>
            </div>
          )}

          {(error || loadTraceFailed) && (
            <div className="p-8 text-center">
              <p className="text-destructive mb-4">{t("error")}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                {t("retry")}
              </Button>
            </div>
          )}

          {!isLoading &&
            !isLoadingTrace &&
            !error &&
            !loadTraceFailed &&
            timelineItems.length === 0 && (
              <div className="p-8 text-center">
                <Database className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">{t("noData")}</p>
              </div>
            )}

          {!isLoading &&
            !isLoadingTrace &&
            !error &&
            !loadTraceFailed &&
            timelineItems.length > 0 && (
              <Timeline defaultValue={1}>
                {timelineItems.map((item, index) => (
                  <TimelineItem
                    key={item.id}
                    step={index + 1}
                    className="group-data-[orientation=vertical]/timeline:ms-10"
                    data-completed={item.isCompleted}
                  >
                    <TimelineHeader>
                      <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />
                      <TimelineTitle className="mt-0.5 flex items-center space-x-2">
                        <span>{item.title}</span>
                        <div className="flex items-center space-x-1">
                          <span
                            className={cn(
                              "rounded px-2 py-0.5 text-xs",
                              item.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            )}
                          >
                            {item.status}
                          </span>
                        </div>
                      </TimelineTitle>
                      <TimelineIndicator className="bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7">
                        <item.icon size={14} />
                      </TimelineIndicator>
                    </TimelineHeader>
                    <TimelineContent>
                      <div className="space-y-2">
                        {item.description && (
                          <p className="text-muted-foreground text-sm">
                            {item.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 gap-2">
                          <div className="col-span-2 flex items-center space-x-1">
                            <FileText className="h-3 w-3" />
                            <span>
                              {t("type")}: {item.type}
                            </span>
                          </div>
                          {item.location && (
                            <div className="col-span-2 flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {t("location")}: {item.location}
                              </span>
                            </div>
                          )}
                          {item.id && (
                            <div className="col-span-2 flex items-center space-x-1">
                              <IdCard className="h-3 w-3" />
                              <span>
                                {t("id")}: {item.id}
                              </span>
                            </div>
                          )}
                          {item.publisher && (
                            <div className="col-span-2 flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>
                                {t("publisher")}: {item.publisher}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <TimelineDate className="mt-2 mb-0">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : t("unknownDate")}
                      </TimelineDate>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Timeline 项目类型定义
interface TimelineItemData {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  createdAt: string;
  publisher: string;
  location: string;
  icon: any;
  isCompleted: boolean;
}
