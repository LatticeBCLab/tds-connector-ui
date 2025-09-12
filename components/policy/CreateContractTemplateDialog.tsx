"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useDataSpace } from "@/lib/contexts/DataSpaceContext";
import { useCreateContractTemplate, useListPolicies } from "@/lib/gen";
import { AlertTriangle, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Spinner } from "../ui/spinner";

interface PolicyData {
  id: string;
  name?: string;
  description?: string;
  value?: any;
  security_level?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  [key: string]: any; // For additional fields
}

interface PoliciesResponse {
  policies?: PolicyData[];
  page?: number;
  page_size?: number;
  total?: number;
}

interface CreateContractTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateContractTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateContractTemplateDialogProps) {
  const t = useTranslations("Policy");
  const { currentDataSpace } = useDataSpace();

  const { data: policiesData, isLoading: loadingPolicies } = useListPolicies({
    page: 1,
    page_size: 50, // 获取足够多的策略
  });
  const createContractTemplateMutation = useCreateContractTemplate({
    mutation: {
      onSuccess: () => {
        toast.success("Contract template created successfully!");
        onSuccess?.();
        onOpenChange(false);
        resetForm();
      },
      onError: (error) => {
        toast.error("Failed to create contract template!");
        setErrors([error.message || "Failed to create contract template"]);
      },
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "banned",
  });

  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const policies = (policiesData as PoliciesResponse)?.policies || [];

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "active",
    });
    setSelectedPolicyIds([]);
    setErrors([]);
  };

  const handleSubmit = () => {
    const newErrors: string[] = [];

    // Validation
    if (!formData.name.trim()) {
      newErrors.push(t("createContractDialog.nameRequired"));
    }

    if (!formData.description.trim()) {
      newErrors.push(t("createContractDialog.descriptionRequired"));
    }

    if (selectedPolicyIds.length === 0) {
      newErrors.push(t("createContractDialog.policyRequired"));
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create policies map: { [policyId]: policyData }
    const policiesMap: Record<string, any> = {};
    selectedPolicyIds.forEach((policyId) => {
      const policy = policies.find((p: PolicyData) => p.id === policyId);
      if (policy) {
        // Store the entire policy object as a snapshot
        policiesMap[policyId] = policy;
      }
    });

    // Create contract template data
    const contractTemplateData = {
      data_space_id: currentDataSpace?.id,
      name: formData.name,
      description: formData.description,
      policies: policiesMap,
      status: formData.status,
    };

    createContractTemplateMutation.mutate({ data: contractTemplateData });
  };

  const handlePolicyToggle = (policyId: string, checked: boolean) => {
    if (checked) {
      setSelectedPolicyIds((prev) => [...prev, policyId]);
    } else {
      setSelectedPolicyIds((prev) => prev.filter((id) => id !== policyId));
    }

    // Clear errors when user makes changes
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {t("createContractDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {t("createContractDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Error Messages */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-inside list-disc space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("createContractDialog.nameLabel")}</Label>
              <Input
                id="name"
                className="border-border"
                placeholder={t("createContractDialog.namePlaceholder")}
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("createContractDialog.descriptionLabel")}</Label>
              <Textarea
                id="description"
                className="border-border"
                placeholder={t("createContractDialog.descriptionPlaceholder")}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t("createContractDialog.statusLabel")}</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "banned") =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="border-border w-48">
                  <SelectValue placeholder={t("createContractDialog.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("createContractDialog.active")}</SelectItem>
                  <SelectItem value="banned">{t("createContractDialog.banned")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Policy Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">{t("createContractDialog.selectPolicies")}</Label>
              {selectedPolicyIds.length > 0 && (
                <Badge variant="secondary">
                  {t("createContractDialog.selected", {count: selectedPolicyIds.length})}
                </Badge>
              )}
            </div>

            {loadingPolicies ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start space-x-3">
                        <Skeleton className="mt-1 h-4 w-4" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-3 pr-4">
                  {policies.map((policy: PolicyData) => {
                    const isSelected = selectedPolicyIds.includes(policy.id);

                    return (
                      <Card
                        key={policy.id}
                        className={`transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <CardTitle className="text-sm leading-tight">
                                    {policy.name || t("createContractDialog.unnamedPolicy")}
                                  </CardTitle>
                                </div>
                                <Checkbox
                                  id={policy.id}
                                  className="border-border flex-shrink-0"
                                  checked={isSelected}
                                  onCheckedChange={(checked) =>
                                    handlePolicyToggle(policy.id, !!checked)
                                  }
                                />
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {policy.security_level && (
                                  <Badge
                                    variant={
                                      policy.security_level === "high"
                                        ? "destructive"
                                        : policy.security_level === "medium"
                                          ? "default"
                                          : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {policy.security_level}
                                  </Badge>
                                )}
                                {policy.icon && (
                                  <Badge variant="outline" className="text-xs">
                                    {policy.icon}
                                  </Badge>
                                )}
                                {/* {isSelected && (
                                  <CheckCircle className="text-primary h-4 w-4" />
                                )} */}
                              </div>
                              <p className="text-muted-foreground text-xs leading-relaxed">
                                {policy.description ||
                                  t("createContractDialog.noDescription")}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-muted-foreground flex flex-col gap-2 text-xs">
                            <span>{t("createContractDialog.policyId")}: {policy.id}</span>
                            {policy.created_at && (
                              <span>
                                {t("createContractDialog.created")}:{" "}
                                {new Date(
                                  policy.created_at
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {policies.length === 0 && (
                    <div className="py-8 text-center">
                      <Shield className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                      <h3 className="text-muted-foreground mb-2 text-lg font-semibold">
                        {t("createContractDialog.noPoliciesAvailable")}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {t("createContractDialog.noPoliciesDescription")}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createContractTemplateMutation.isPending}
          >
            {t("createContractDialog.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createContractTemplateMutation.isPending}
          >
            {createContractTemplateMutation.isPending ? (
              <>
                <Spinner variant="circle" />
                {t("createContractDialog.creating")}
              </>
            ) : (
              t("createContractDialog.createButton")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
