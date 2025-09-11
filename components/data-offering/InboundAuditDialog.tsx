"use client";

import { DateTimePicker } from "@/components/DateTimePicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useApproveResourceAuditByID } from "@/lib/gen/hooks/useApproveResourceAuditByID";
import { useCreateResourceAudit } from "@/lib/gen/hooks/useCreateResourceAudit";
import { useAppStore } from "@/lib/stores/app-store";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const inboundAuditSchema = z.object({
  comments: z.string().min(1, "Comments are required"),
  expires_at: z.string().min(1, "Expiration date is required"),
});

type InboundAuditFormData = z.infer<typeof inboundAuditSchema>;

interface AuditStage {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "error";
  progress: number;
}

interface InboundAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: string;
  onSuccess?: () => void;
}

const AUDIT_STAGES: AuditStage[] = [
  {
    id: "sensitivity",
    name: "Sensitivity Detection",
    description:
      "Analyze data sensitivity levels and classification requirements",
    status: "pending",
    progress: 0,
  },
  {
    id: "personal_info",
    name: "Personal Information Detection",
    description: "Identify and classify personal information and privacy data",
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
    id: "malicious",
    name: "Malicious Content Detection",
    description: "Scan for malicious content and security threats",
    status: "pending",
    progress: 0,
  },
];

export function InboundAuditDialog({
  open,
  onOpenChange,
  resourceId,
  onSuccess,
}: InboundAuditDialogProps) {
  const { currentDataSpaceId } = useAppStore();
  const [currentStep, setCurrentStep] = useState<
    "form" | "audit" | "completed"
  >("form");
  const [stages, setStages] = useState<AuditStage[]>(AUDIT_STAGES);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditId, setAuditId] = useState<string>("");

  const form = useForm<InboundAuditFormData>({
    resolver: zodResolver(inboundAuditSchema),
    defaultValues: {
      comments: "Initial inbound audit request",
      expires_at: "",
    },
  });

  const createAuditMutation = useCreateResourceAudit();
  const approveAuditMutation = useApproveResourceAuditByID();

  const auditor = process.env.NEXT_PUBLIC_USER_DID || "";

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

  const onSubmit = async (data: InboundAuditFormData) => {
    try {
      const auditData = {
        auditor,
        comments: data.comments,
        dataspace_id: currentDataSpaceId || "",
        expires_at: new Date(data.expires_at).toISOString(),
        metadata: {},
        resource_id: resourceId,
        type: "INBOUND" as any,
      };

      const result = await createAuditMutation.mutateAsync({
        data: auditData,
      });

      setAuditId(result.id || "");
      setCurrentStep("audit");

      // Start automatic audit process
      startAutomaticAudit();
    } catch (error) {
      console.error("Failed to create audit:", error);
      toast.error("Failed to create audit");
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

  const handleApproveAudit = useCallback(async () => {
    if (!auditId) return;

    try {
      await approveAuditMutation.mutateAsync({
        id: auditId,
        data: {
          auditor,
          comments: "Audit approved automatically",
        },
      });

      setCurrentStep("completed");
      toast.success("Inbound audit completed successfully");

      // Call onSuccess after a short delay
      setTimeout(() => {
        onSuccess?.();
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to approve audit:", error);
      toast.error("Failed to approve audit");
    }
  }, [auditId, auditor, approveAuditMutation, onSuccess, onOpenChange]);

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

  // Simulate audit process (copied from OutboundAuditDialog)
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
  }, [isAuditing, currentStageIndex, stages, handleApproveAudit]);

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Inbound Data Audit</DialogTitle>
          <DialogDescription>
            {currentStep === "form" &&
              "Submit resource for inbound audit review"}
            {currentStep === "audit" && "Automatic audit in progress..."}
            {currentStep === "completed" && "Audit completed successfully"}
          </DialogDescription>
        </DialogHeader>

        {currentStep === "form" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Auditor (Read-only) */}
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Auditor
                  </label>
                  <Input
                    value={auditor}
                    readOnly
                    className="bg-muted/50 border-border text-muted-foreground"
                  />
                </div>

                {/* Comments */}
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter audit comments..."
                          className="border-border resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Expires At */}
                <FormField
                  control={form.control}
                  name="expires_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expires At</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select expiration date and time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={createAuditMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAuditMutation.isPending}
                  className="min-w-24"
                >
                  {createAuditMutation.isPending ? (
                    <>
                      <Spinner variant="bars" className="mr-2 h-4 w-4" />
                      Creating...
                    </>
                  ) : (
                    "Start Audit"
                  )}
                </Button>
              </DialogFooter>
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
                Processing Audit...
              </Button>
            </div>
          </div>
        )}

        {currentStep === "completed" && (
          <div className="space-y-4 py-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h3 className="text-lg font-semibold">
              Audit Completed Successfully
            </h3>
            <p className="text-muted-foreground">
              The inbound data audit has been completed and approved.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
