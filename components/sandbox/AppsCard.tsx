"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Database, Tag, User } from "lucide-react";
import Image from "next/image";
import { useTranslations } from 'next-intl';

// 定义App的数据类型
interface App {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  dataSpaceId: string;
  supportedRuntimes: string[];
  entryPoint: string;
  dependencies: string[];
  defaultConfig: string;
  environmentVariables: string;
  resourceRequirements: string;
  status: string;
  isPublic: boolean;
  category: string;
  tags: string[];
  icon: string;
  documentation: string;
  downloadCount: number;
  runCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface AppsCardProps {
  apps: App[];
}

export function AppsCard({ apps }: AppsCardProps) {
  const t = useTranslations('Sandbox.AppsCard');
  // 格式化计数显示
  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // 解析资源需求
  const parseResourceRequirements = (requirements: string) => {
    try {
      return JSON.parse(requirements);
    } catch {
      return {};
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200";
      case "published":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "deprecated":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // 获取分类颜色
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "ai_ml":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "data_analysis":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "web_scraping":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "finance":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>
              {t('description')}
            </CardDescription>
          </div>
          <div className="text-muted-foreground text-sm">
            {apps.length} app{apps.length !== 1 ? "s" : ""} available
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {apps && apps.length > 0 ? (
          <ScrollArea className="w-full">
            <div className="grid auto-cols-[330px] grid-flow-col gap-4 pb-4">
              {apps.map((app) => {
                const resourceReqs = parseResourceRequirements(
                  app.resourceRequirements || "{}"
                );
                return (
                  <div key={app.id} className="space-y-3 rounded-lg border p-4">
                    {/* Header with icon and title */}
                    <div className="flex items-start space-x-3">
                      {app.icon ? (
                        <div className="relative flex-shrink-0">
                          <Image
                            src={app.icon}
                            alt={app.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-lg object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.parentElement) {
                                target.parentElement.style.display = "none";
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <Database className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center space-x-2">
                          <h4 className="truncate text-sm font-medium">
                            {app.name}
                          </h4>
                          {app.status === "verified" && (
                            <span className="text-xs text-green-600">✓</span>
                          )}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          v{app.version}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      className="text-muted-foreground text-xs"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {app.description}
                    </p>

                    {/* Status and Category Badges */}
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(app.status)}`}
                      >
                        {app.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getCategoryColor(app.category)}`}
                      >
                        {app.category.replace("_", " ")}
                      </Badge>
                    </div>

                    {/* Runtime and Resource Info */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Runtime:</span>
                        <span className="text-muted-foreground">
                          {app.supportedRuntimes.join(", ")}
                        </span>
                      </div>
                      {resourceReqs.gpu && (
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">GPU:</span>
                          <span className="text-muted-foreground">
                            {resourceReqs.gpu} ({resourceReqs.vram || "N/A"})
                          </span>
                        </div>
                      )}
                      {resourceReqs.storage && (
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Storage:</span>
                          <span className="text-muted-foreground">
                            {resourceReqs.storage}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {app.tags && app.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {app.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            <Tag className="mr-1 h-2 w-2" />
                            {tag}
                          </Badge>
                        ))}
                        {app.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{app.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      {/* <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Download className="h-3 w-3" />
                          <span>{formatCount(app.downloadCount)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Play className="h-3 w-3" />
                          <span>{formatCount(app.runCount)}</span>
                        </div>
                      </div> */}
                      {/* Author */}
                      <div className="text-muted-foreground flex items-center space-x-1 text-xs">
                        <User className="h-3 w-3" />
                        <span className="truncate">{app.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(app.updatedAt).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {/* <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                      >
                        <Play className="mr-1 h-3 w-3" />
                        Run
                      </Button>
                      {app.documentation && (
                        <Button size="sm" variant="ghost" className="p-2">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div> */}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center">
            <EmptyState
              icon={Database}
              title={t('noApplicationsFound')}
              description={t('noContainerImages')}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
