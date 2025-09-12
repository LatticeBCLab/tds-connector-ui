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
import { ModelsTraceResponse } from "@/lib/gen";
import { useGetResourceByID } from "@/lib/gen/hooks/useGetResourceByID";
import { useGetTracesByResourceID } from "@/lib/gen/hooks/useGetTracesByResourceID";

import { ModelsResource } from "@/lib/gen/types/models/Resource";
import { cn } from "@/lib/utils";
import {
  Database,
  FileText,
  GitBranch,
  MapPin,
  User
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
  //
  // 获取资源详细信息，包括traces
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
  console.log(traceData)
  // 构建溯源链路树结构
  const traceabilityTree = useMemo(() => {
    if (!resourceData) return [];
    
    const buildTree = (resource: ModelsResource, traces: ModelsTraceResponse[] = [], level = 0): TraceNode[] => {
      const node: TraceNode = {
        id: resource.id || '',
        title: resource.title || 'Unknown Resource',
        description: resource.description || '',
        type: resource.type?.toString() || 'Unknown',
        status: resource.status?.toString() || 'Unknown',
        createdAt: resource.created_at || '',
        publisher: resource.publisher || '',
        location: resource.location?.toString() || '',
        level,
        children: [],
      };
      if (traces.length ===0) {
        return [node];
      }
      
      // 如果有追踪数据，构建子节点
      if (traces[level]?.parent_data?.length) {
        node.children = traces[level]?.parent_data?.flatMap(trace => {
          if (trace?.id) {
            return buildTree(trace, traces, level + 1);
          }
          return [];
        });
      }

      return [node];
    };

    // 使用获取到的追踪数据构建树
    return buildTree(resourceData, traceData?.data || []);
  }, [resourceData, traceData]);

  const renderTraceNode = (node: TraceNode, isLast = false) => {
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} className="relative">
        {/* 连接线 */}
        {node.level > 0 && (
          <>
            {/* 水平线 */}
            <div 
              className="absolute left-0 top-6 h-px bg-border"
              style={{ width: `${node.level * 24 - 12}px` }}
            />
            {/* 垂直线 */}
            {!isLast && (
              <div 
                className="absolute top-6 h-full w-px bg-border"
                style={{ left: `${(node.level - 1) * 24 + 12}px` }}
              />
            )}
            {/* 节点连接点 */}
            <div 
              className="absolute top-5 h-2 w-2 rounded-full bg-primary"
              style={{ left: `${node.level * 24 - 4}px` }}
            />
          </>
        )}
        
        {/* 节点内容 */}
        <div 
          className={cn(
            "mb-3 rounded-lg border p-4",
            node.level === 0 ? "bg-primary/5 border-primary/20" : "bg-muted/30"
          )}
          style={{ marginLeft: `${node.level * 24}px` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-4 w-4 text-primary" />
                <h4 className="font-medium">{node.title}</h4>
                {hasChildren && (
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <GitBranch className="h-3 w-3" />
                    <span>{node.children.length} traces</span>
                  </div>
                )}
              </div>
              
              {node.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {node.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>Type: {node.type}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs",
                    node.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  )}>
                    {node.status}
                  </span>
                </div>
                {node.publisher && (
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>Publisher: {node.publisher}</span>
                  </div>
                )}
                {node.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>Location: {node.location}</span>
                  </div>
                )}
                {node.createdAt && (
                  <div className="flex items-center space-x-1">
                    <span>Created: {new Date(node.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                )}
                {node.id && (
                  <div className="flex items-center space-x-1">
                    <span>id: {node.id}</span>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
        
        {/* 渲染子节点 */}
        {hasChildren && (
          <div className="relative">
            {node.children.map((child, index) => 
              renderTraceNode(child, index === node.children.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5" />
            <span>{t("title")}</span>
          </DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          {(isLoading || isLoadingTrace) && (
            <div className="flex flex-col items-center gap-3 p-8">
              <Spinner variant="bars" />
              <p className="text-muted-foreground text-sm">
                {t("loading")}
              </p>
            </div>
          )}
          
          {(error || loadTraceFailed) && (
            <div className="text-center p-8">
              <p className="text-destructive mb-4">
                {t("error")}
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                {t("common.retry")}
              </Button>
            </div>
          )}
          
          {!isLoading && !isLoadingTrace && !error && !loadTraceFailed && traceabilityTree.length === 0 && (
            <div className="text-center p-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t("noData")}
              </p>
            </div>
          )}
          
          {!isLoading && !isLoadingTrace && !error && !loadTraceFailed && traceabilityTree.length > 0 && (
            <div className="space-y-4">
              {traceabilityTree.map((node, index) => 
                renderTraceNode(node, index === traceabilityTree.length - 1)
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// 溯源节点类型定义
interface TraceNode {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  createdAt: string;
  publisher: string;
  location: string;
  level: number;
  children: TraceNode[];
}
