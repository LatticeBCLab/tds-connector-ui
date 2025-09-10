"use client";

import { MetricCard } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useContracts } from "@/hooks";
import { useDataSpace } from "@/lib/contexts/DataSpaceContext";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  Globe,
  Lock,
  Plus,
  Shield,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { CreateContractTemplateDialog } from "./CreateContractTemplateDialog";

// Policy规则类型图标映射
const policyRuleIcons = {
  access_period: Clock,
  access_count: TrendingUp,
  identity_restriction: Users,
  encryption: Lock,
  ip_restriction: Globe,
  transfer_limit: FileText,
  qps_limit: Shield,
};

// Policy规则类型名称映射
const policyRuleTypeNames = {
  access_period: "Access Period Limitation",
  access_count: "Access Count Limitation",
  identity_restriction: "Identity Restriction",
  encryption: "Encryption & Transmission Protection",
  ip_restriction: "Access IP Restriction",
  transfer_limit: "Single Transfer Limit",
  qps_limit: "Data Transmission QPS Limit",
};

export function PolicyContractsTab() {
  const {
    digitalContracts,
    policyTemplates,
    contractTemplates,
    activeContracts,
    pendingContracts,
    isCreateContractTemplateOpen,
    setIsCreateContractTemplateOpen,
    createContractTemplate,
  } = useContracts();

  const { currentDataSpace } = useDataSpace();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Active Policy Templates"
          value={policyTemplates.length}
          description="Currently available"
          icon={Shield}
          variant="primary"
        />
        <MetricCard
          title="Contract Templates"
          value={contractTemplates.length}
          description="Ready to use"
          icon={FileText}
          variant="secondary"
        />
        <MetricCard
          title="Active Contracts"
          value={activeContracts.length}
          description="Currently enforced"
          icon={CheckCircle}
        />
        <MetricCard
          title="Data Space"
          value={currentDataSpace.name}
          description="Current environment"
          icon={Globe}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Policy Templates */}
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
              <Button size="sm" className="hidden">
                <Plus className="h-4 w-4" />
                Add Policy
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[480px] px-6 pb-6">
              <div className="space-y-4">
                {policyTemplates.map((policy) => (
                  <Card key={policy.id}>
                    <CardHeader className="pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{policy.name}</h4>
                          <Badge
                            variant={
                              policy.severity === "high"
                                ? "destructive"
                                : policy.severity === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {policy.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {policy.category}
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
                        {/* 简化展示：每个Policy只有一个规则 */}
                        {policy.rules.length > 0 && (
                          <div className="bg-muted/50 flex items-center justify-between rounded-lg">
                            <div className="flex items-center gap-3">
                              {(() => {
                                const rule = policy.rules[0]; // 取第一个规则
                                const IconComponent =
                                  policyRuleIcons[rule.type] || Shield;
                                return (
                                  <>
                                    <IconComponent className="text-primary h-5 w-5" />
                                    <div>
                                      <p className="text-sm font-medium">
                                        {rule.name}
                                      </p>
                                      <p className="text-muted-foreground text-xs">
                                        {rule.description}
                                      </p>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-sm">
                                {policy.rules[0].value} {policy.rules[0].unit}
                              </Badge>
                              {policy.rules[0].isActive ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t pt-3">
                        <div className="text-muted-foreground flex items-center gap-4 text-xs">
                          <span>Enforcement: {policy.enforcementType}</span>
                          <span>•</span>
                          <span>
                            Created:{" "}
                            {new Date(policy.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Contract Templates */}
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
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsCreateContractTemplateOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create Contract
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[480px] px-6 pb-6">
              <div className="space-y-4">
                {contractTemplates.map((contract) => (
                  <Card key={contract.id}>
                    <CardHeader className="pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{contract.name}</h4>
                          <Badge
                            variant={
                              contract.status === "active"
                                ? "default"
                                : contract.status === "draft"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {contract.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {contract.contractType === "single_policy"
                              ? "Single Policy"
                              : "Multi Policy"}
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
                        {contract.description}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <h5 className="mb-2 text-sm font-bold">
                            Included Policies:
                          </h5>
                          <div className="space-y-1">
                            {contract.policyIds.map((policyId) => {
                              const policy = policyTemplates.find(
                                (p) => p.id === policyId
                              );
                              return policy ? (
                                <div
                                  key={policyId}
                                  className="bg-muted/50 flex items-center gap-2 rounded py-1"
                                >
                                  <Shield className="text-primary h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    {policy.name}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="ml-auto text-xs"
                                  >
                                    1 rule
                                  </Badge>
                                </div>
                              ) : (
                                <div
                                  key={policyId}
                                  className="bg-muted/50 flex items-center gap-2 rounded p-2"
                                >
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  <span className="text-muted-foreground text-sm">
                                    Policy not found: {policyId}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-3">
                          <div className="text-muted-foreground flex items-center gap-4 text-xs">
                            <span>Used: {contract.usageCount} times</span>
                            <span>•</span>
                            <span>
                              Created:{" "}
                              {new Date(
                                contract.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <Button size="sm" variant="outline">
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Create Contract Template Dialog */}
      <CreateContractTemplateDialog
        open={isCreateContractTemplateOpen}
        onOpenChange={setIsCreateContractTemplateOpen}
        policyTemplates={policyTemplates}
        onCreateContract={createContractTemplate}
      />
    </div>
  );
}
