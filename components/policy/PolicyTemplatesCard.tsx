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
import { useListPolicies } from "@/lib/gen/hooks/useListPolicies";
import {
  Clock,
  Cpu,
  Edit,
  Eye,
  FileText,
  IdCard,
  Lock,
  Network,
  Plus,
  Shield,
  Target,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

const policyIconMap: Record<string, any> = {
  "clock-fading": Clock,
  counter: TrendingUp,
  "shield-user": Users,
  "id-card": IdCard,
  target: Target,
  mask: UserCheck, // 使用 UserCheck 替代不存在的 Mask
  "file-text": FileText,
  lock: Lock,
  cpu: Cpu,
  network: Network,
};

// 安全级别颜色映射
const getSecurityLevelVariant = (level: string) => {
  switch (level) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
};

// API返回的策略数据类型
interface PolicyFromAPI {
  id: string;
  name: string;
  description: string;
  value: {
    fields?: Record<string, any>;
    [key: string]: any;
  };
  security_level: "high" | "medium" | "low";
  icon: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface PolicyTemplatesCardProps {
  showAddButton?: boolean;
  onAddClick?: () => void;
}

export function PolicyTemplatesCard({
  showAddButton = false,
  onAddClick,
}: PolicyTemplatesCardProps) {
  const {
    data: policiesResponse,
    isLoading,
    error,
  } = useListPolicies({
    page: 1,
    page_size: 50, // 获取足够多的策略
  });

  const policies =
    ((policiesResponse as any)?.policies as PolicyFromAPI[]) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Policy Templates
              </CardTitle>
              <CardDescription>
                Define access control and usage policies for data sharing
              </CardDescription>
            </div>
            {showAddButton && (
              <Button size="sm" onClick={onAddClick}>
                <Plus className="h-4 w-4" />
                Add Policy
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground text-sm">
              Loading policies...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Policy Templates
              </CardTitle>
              <CardDescription>
                Define access control and usage policies for data sharing
              </CardDescription>
            </div>
            {showAddButton && (
              <Button size="sm" onClick={onAddClick}>
                <Plus className="h-4 w-4" />
                Add Policy
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-500">Failed to load policies</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (policies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Policy Templates
              </CardTitle>
              <CardDescription>
                Define access control and usage policies for data sharing
              </CardDescription>
            </div>
            {showAddButton && (
              <Button size="sm" onClick={onAddClick}>
                <Plus className="h-4 w-4" />
                Add Policy
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Shield}
            title="No policies found"
            description="Create a new policy to get started"
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
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Policy Templates
            </CardTitle>
            <CardDescription>
              Define access control and usage policies for data sharing
            </CardDescription>
          </div>
          {showAddButton && (
            <Button size="sm" onClick={onAddClick}>
              <Plus className="h-4 w-4" />
              Add Policy
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[480px] px-6 pb-6">
          <div className="space-y-4">
            {policies.map((policy) => {
              const IconComponent = policyIconMap[policy.icon] || Shield;

              return (
                <Card key={policy.id}>
                  <CardHeader className="pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{policy.name}</h4>
                        <Badge
                          variant={getSecurityLevelVariant(
                            policy.security_level
                          )}
                        >
                          {policy.security_level}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {policy.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* 策略配置信息 */}
                      <div className="bg-muted/50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <IconComponent className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="mb-2 text-sm font-medium">
                              Policy Configuration
                            </p>
                            {policy.value.fields && (
                              <div className="space-y-1">
                                {Object.entries(policy.value.fields).map(
                                  ([key, fieldInfo]) => {
                                    const fieldValue = policy.value[key];
                                    if (fieldValue === undefined) return null;

                                    const displayName =
                                      (fieldInfo as any)?.["zh-CN"] || key;
                                    const displayValue = Array.isArray(
                                      fieldValue
                                    )
                                      ? fieldValue.join(", ")
                                      : typeof fieldValue === "object"
                                        ? JSON.stringify(fieldValue)
                                        : String(fieldValue);

                                    return (
                                      <div
                                        key={key}
                                        className="flex items-center justify-between"
                                      >
                                        <span className="text-muted-foreground text-xs">
                                          {displayName}:
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="ml-2 text-xs"
                                        >
                                          {displayValue}
                                        </Badge>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t pt-3">
                      <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <span>Security: {policy.security_level}</span>
                        <span>•</span>
                        <span>
                          Created:{" "}
                          {new Date(policy.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
