"use client";

import { StatusBadge } from "@/components/shared";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetSandbox } from "@/lib/gen";
import { useApproveJob } from "@/lib/gen/hooks/useApproveJob";
import { useCreateResource } from "@/lib/gen/hooks/useCreateResource";
import { useAppStore } from "@/lib/stores/app-store";
import { Activity, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { CreateJobDialog } from "./CreateJobDialog";

// 定义Job的数据类型
interface Job {
  id: string;
  name: string;
  description: string;
  status: string;
  auditStatus?: string;
  connectorDid: string;
  sandboxId: string;
  resourceId: string;
  appId: string;
  startedAt: string | null;
  endedAt: string | null;
  inputDataSize: number;
  outputDataSize: number;
  errorMessage: string;
  processingScript: string;
  configuration: string;
  createdAt: string;
  updatedAt: string;
}

// Interfaces moved to CreateJobDialog component as they are no longer needed here

interface DataProcessingJobsCardProps {
  jobs: Job[];
  runJob: (id: string) => void;
  onJobCreated?: () => void;
}

// 沙盒名称显示组件
const SandboxName = ({ sandboxId }: { sandboxId: string }) => {
  const { data: sandboxData } = useGetSandbox(sandboxId, {
    query: { enabled: !!sandboxId },
  });
  return sandboxData?.name || "Unknown Sandbox";
};

export function DataProcessingJobsCard({
  jobs,
  runJob,
  onJobCreated,
}: DataProcessingJobsCardProps) {
  const t = useTranslations("Sandbox.DataProcessingJobsCard");
  const { currentDataSpaceId } = useAppStore();
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);
  const [auditProgress, setAuditProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<
    "idle" | "approving" | "downloading" | "completed"
  >("idle");

  const approveJobMutation = useApproveJob();
  const createResourceMutation = useCreateResource();

  const handleAuditClick = async (job: Job) => {
    try {
      setProcessingJobId(job.id);
      setCurrentStep("approving");
      setAuditProgress(0);
      setDownloadProgress(0);

      // Step 1: Approve the job with progress simulation
      const approveInterval = setInterval(() => {
        setAuditProgress((prev) => {
          if (prev >= 90) {
            clearInterval(approveInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 500);

      await approveJobMutation.mutateAsync({ id: job.id });
      clearInterval(approveInterval);
      setAuditProgress(100);

      // Wait a moment before starting resource creation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 2: Create resource with progress simulation
      setCurrentStep("downloading");
      const downloadInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(downloadInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 600);

      // Get resource details for the new resource
      const { getResourceByID } = await import(
        "@/lib/gen/clients/getResourceByID"
      );
      const resourceData = await getResourceByID(job.resourceId);

      const location = process.env.NEXT_PUBLIC_LOCATION;
      const publisher = process.env.NEXT_PUBLIC_USER_DID || "";
      const originCountry = resourceData?.originCountry;

      // Generate random config for LocalFile type
      const config = {
        filePath: `/data/processed/${job.name.replace(/\s+/g, "_")}_${Date.now()}.json`,
        format: "JSON",
        fileSize: Math.floor(Math.random() * 50000000) + 1000000, // 1MB to 50MB
      };

      const newResourceData = {
        config,
        dataspace: currentDataSpaceId || "",
        description: job.description,
        location: location as any,
        originCountry: originCountry as any,
        publisher,
        status: "Active" as any,
        title: job.name,
        type: "LocalFile" as any,
        originResource: [job.resourceId],
      };

      await createResourceMutation.mutateAsync({ data: newResourceData });
      clearInterval(downloadInterval);
      setDownloadProgress(100);

      setCurrentStep("completed");
      toast.success("Job approved and resource created successfully");

      // Reset after 2 seconds
      setTimeout(() => {
        setProcessingJobId(null);
        setCurrentStep("idle");
        setAuditProgress(0);
        setDownloadProgress(0);
        onJobCreated?.();
      }, 2000);
    } catch (error) {
      console.error("Error processing job:", error);
      toast.error("Failed to process job");
      setProcessingJobId(null);
      setCurrentStep("idle");
      setAuditProgress(0);
      setDownloadProgress(0);
    }
  };

  const getJobDuration = (startedAt: string | null, endedAt: string | null) => {
    if (!startedAt) return null;
    const start = new Date(startedAt);
    const end = endedAt ? new Date(endedAt) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <CreateJobDialog onSuccess={onJobCreated} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[480px] px-6 pb-6">
          <div className="space-y-3">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <h4 className="text-sm font-medium">{job.name}</h4>
                        <StatusBadge status={job.status} type="job" />
                        {job.status === "completed" && job.auditStatus && (
                          <StatusBadge status={job.auditStatus} type="audit" />
                        )}
                      </div>
                      <div className="text-muted-foreground mb-2 text-xs">
                        {job.description}
                      </div>
                      <div className="text-muted-foreground space-y-1 text-xs">
                        <div>
                          Sandbox: <SandboxName sandboxId={job.sandboxId} />
                        </div>
                        <div className="space-x-4">
                          <span>
                            Created:{" "}
                            {new Date(job.createdAt).toLocaleString("zh-CN")}
                          </span>
                          {job.startedAt && (
                            <span>
                              Started:{" "}
                              {new Date(job.startedAt).toLocaleString("zh-CN")}
                            </span>
                          )}
                          {job.endedAt && (
                            <span>
                              Ended:{" "}
                              {new Date(job.endedAt).toLocaleString("zh-CN")}
                            </span>
                          )}
                          {job.startedAt && (
                            <span>
                              Duration:{" "}
                              {getJobDuration(job.startedAt, job.endedAt)}
                            </span>
                          )}
                        </div>
                        {job.errorMessage && (
                          <div className="text-red-600">
                            Error: {job.errorMessage}
                          </div>
                        )}
                      </div>

                      {/* Progress bars for current processing job */}
                      {processingJobId === job.id && (
                        <div className="mt-3 space-y-2">
                          {currentStep === "approving" && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Approving Job...</span>
                                <span>{auditProgress}%</span>
                              </div>
                              <Progress value={auditProgress} className="h-2" />
                            </div>
                          )}
                          {currentStep === "downloading" && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Creating Resource...</span>
                                <span>{downloadProgress}%</span>
                              </div>
                              <Progress
                                value={downloadProgress}
                                className="h-2"
                              />
                            </div>
                          )}
                          {currentStep === "completed" && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-green-600">
                                <span>Completed Successfully!</span>
                                <span>100%</span>
                              </div>
                              <Progress value={100} className="h-2" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {job.status === "completed" &&
                        job.auditStatus !== "APPROVED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Audit"
                            onClick={() => handleAuditClick(job)}
                            disabled={processingJobId === job.id}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <EmptyState
                  icon={Activity}
                  title={t("noJobsFound")}
                  description={t("createJobToStart")}
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
