"use client";

import { DateTimePicker } from "@/components/DateTimePicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  useApproveResourceAuditByID,
  useCreateResourceAudit,
  useGetUserDIDList,
} from "@/lib/gen";
import { useAppStore } from "@/lib/stores/app-store";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const outboundAuditSchema = z.object({
  comments: z.string().min(1, "Comments are required"),
  expires_at: z.string().min(1, "Expiration date is required"),
});

type OutboundAuditFormData = z.infer<typeof outboundAuditSchema>;

interface AuditStage {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "error";
  progress: number;
}

interface OutboundAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: string;
  onSuccess?: () => void;
}

const AUDIT_STAGES: AuditStage[] = [
  {
    id: "classification",
    name: "Cross-border Data Classification",
    description:
      "Classify and grade cross-border data according to regulations",
    status: "pending",
    progress: 0,
  },
  {
    id: "negative_list",
    name: "Negative List Identification",
    description:
      "Identify data against negative lists and restricted categories",
    status: "pending",
    progress: 0,
  },
  {
    id: "compliance",
    name: "Cross-border Compliance Pre-check",
    description:
      "Verify compliance with cross-border data transfer regulations",
    status: "pending",
    progress: 0,
  },
  {
    id: "legal",
    name: "Legal Compliance Confirmation",
    description: "Confirm legal compliance and regulatory requirements",
    status: "pending",
    progress: 0,
  },
];

export function OutboundAuditDialog({
  open,
  onOpenChange,
  resourceId,
  onSuccess,
}: OutboundAuditDialogProps) {
  const t = useTranslations("outboundAuditDialog");
  const { currentDataSpaceId } = useAppStore();
  const [currentStep, setCurrentStep] = useState<
    "form" | "audit" | "completed"
  >("form");
  const [stages, setStages] = useState<AuditStage[]>(AUDIT_STAGES);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditId, setAuditId] = useState<string>("");

  const createAuditMutation = useCreateResourceAudit();
  const approveAuditMutation = useApproveResourceAuditByID();

  const form = useForm<OutboundAuditFormData>({
    resolver: zodResolver(outboundAuditSchema),
    defaultValues: {
      comments: "Initial outbound audit request",
      expires_at: "",
    },
  });

  const { data: userDIDList } = useGetUserDIDList();
  const auditor =
    userDIDList?.filter(
      (userDID) => userDID !== process.env.NEXT_PUBLIC_USER_DID
    )[0] || "";

  // Reset form and state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setCurrentStep("form");
      setStages(
        AUDIT_STAGES.map((stage) => ({
          ...stage,
          status: "pending",
          progress: 0,
        }))
      );
      setCurrentStageIndex(-1);
      setIsAuditing(false);
      setAuditId("");
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: OutboundAuditFormData) => {
    try {
      if (!currentDataSpaceId) {
        toast.error("Please select a data space first");
        return;
      }

      if (!auditor) {
        toast.error("User DID not configured");
        return;
      }

      // Format expires_at to ISO 8601 format (2006-01-02T15:04:05Z07:00)
      const formattedExpiresAt = new Date(data.expires_at).toISOString();

      const auditData = {
        auditor,
        comments: data.comments,
        dataspace_id: currentDataSpaceId,
        expires_at: formattedExpiresAt,
        metadata: {},
        resource_id: resourceId,
        type: "OUTBOUND" as const,
      };

      const result = await createAuditMutation.mutateAsync({ data: auditData });

      // Store audit ID for later approval
      setAuditId(result.id || "");

      // Start automatic audit process
      setCurrentStep("audit");
      startAutomaticAudit();
      // toast.success("Audit request created successfully");
    } catch (error) {
      console.error("Error creating audit:", error);
      toast.error("Failed to create audit request");
    }
  };

  const startAutomaticAudit = useCallback(() => {
    setIsAuditing(true);
    setCurrentStageIndex(0);
    setStages((prev) =>
      prev.map((stage, index) => ({
        ...stage,
        status: index === 0 ? "running" : "pending",
        progress: 0,
      }))
    );
  }, []);

  const getStageIcon = (stage: AuditStage) => {
    switch (stage.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "running":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  // Simulate audit process
  useEffect(() => {
    if (
      !isAuditing ||
      currentStageIndex === -1 ||
      currentStageIndex >= stages.length
    ) {
      return;
    }

    const currentStage = stages[currentStageIndex];
    if (currentStage.status === "completed") {
      // Move to next stage
      const nextIndex = currentStageIndex + 1;
      if (nextIndex < stages.length) {
        setCurrentStageIndex(nextIndex);
        setStages((prev) =>
          prev.map((stage, index) =>
            index === nextIndex
              ? { ...stage, status: "running", progress: 0 }
              : stage
          )
        );
      } else {
        // All stages completed, call approve API
        setIsAuditing(false);
        handleApproveAudit();
      }
      return;
    }

    // Set current stage to running status
    if (currentStage.status === "pending") {
      setStages((prev) =>
        prev.map((stage, index) =>
          index === currentStageIndex ? { ...stage, status: "running" } : stage
        )
      );
    }

    // Simulate progress update
    const interval = setInterval(
      () => {
        setStages((prev) => {
          const newStages = [...prev];
          const stage = newStages[currentStageIndex];

          if (stage.status === "running") {
            // Random progress increase to simulate real audit process
            const increment = Math.random() * 15 + 5; // 5-20% increase
            const newProgress = Math.min(100, stage.progress + increment);

            stage.progress = newProgress;

            if (newProgress >= 100) {
              stage.status = "completed";
              stage.progress = 100;
            }
          }

          return newStages;
        });
      },
      500 + Math.random() * 1000
    ); // Random interval for realism

    return () => clearInterval(interval);
  }, [isAuditing, currentStageIndex, stages]);

  const handleApproveAudit = async () => {
    try {
      if (!auditId) {
        toast.error("Audit ID not found");
        return;
      }

      await approveAuditMutation.mutateAsync({
        id: auditId,
        data: {
          auditor,
          comments: "Audit approved automatically",
        },
      });

      setCurrentStep("completed");
      toast.success("Audit approved successfully");

      setTimeout(() => {
        onSuccess?.();
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error("Error approving audit:", error);
      toast.error("Failed to approve audit");
    }
  };

  const handleClose = () => {
    if (currentStep === "audit" && isAuditing) {
      // Don't allow closing during audit
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        {currentStep === "form" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Read-only auditor field */}
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  {t("fields.auditor")}
                </label>
                <Input
                  value={auditor}
                  readOnly
                  className="border-border bg-muted/50 text-muted-foreground"
                />
              </div>

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.comments")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("fields.commentsPlaceholder")}
                        className="border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.expirationDateTime")}</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t("fields.expirationDateTimePlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  {t("buttons.cancel")}
                </Button>
                <Button type="submit" disabled={createAuditMutation.isPending}>
                  {createAuditMutation.isPending ? (
                    <>
                      <Spinner variant="circle" />
                      {t("buttons.creating")}
                    </>
                  ) : (
                    t("buttons.createAudit")
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {currentStep === "audit" && (
          <div className="space-y-6">
            {/* Audit Progress Display */}
            <div className="space-y-4">
              {stages.map((stage, index) => (
                <div key={stage.id} className="space-y-3">
                  {/* Stage Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStageIcon(stage)}
                      <div>
                        <h4
                          className={cn(
                            "text-sm font-medium",
                            stage.status === "running" && "text-blue-600",
                            stage.status === "completed" && "text-green-600",
                            stage.status === "error" && "text-red-600"
                          )}
                        >
                          {stage.name}
                        </h4>
                        <p className="text-muted-foreground text-xs">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {stage.status === "running" && (
                        <div className="text-muted-foreground text-xs">
                          {Math.round(stage.progress)}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stage Progress Bar */}
                  <Progress
                    value={stage.progress}
                    className={cn(
                      "h-2 transition-all duration-500",
                      stage.status === "running" &&
                        "ring-primary/60 ring-1 ring-offset-1"
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <Button variant="secondary" disabled>
                <Loader2 className="size-4 animate-spin" />
                {t("buttons.processingAudit")}
              </Button>
            </div>
          </div>
        )}

        {currentStep === "completed" && (
          <div className="space-y-4 py-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h3 className="text-lg font-semibold">
              {t("completion.title")}
            </h3>
            <p className="text-muted-foreground">
              {t("completion.description")}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
