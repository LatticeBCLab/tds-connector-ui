"use client";

import { StatusBadge } from "@/components/shared";
import { useTranslations } from 'next-intl';
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetSandbox } from "@/lib/gen";
import { Activity, Edit, Eye, Play, Trash2 } from "lucide-react";
import { CreateJobDialog } from "./CreateJobDialog";

// 定义Job的数据类型
interface Job {
  id: string;
  name: string;
  description: string;
  status: string;
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
  const t = useTranslations('Sandbox.DataProcessingJobsCard');
  console.log("jobs", jobs);
  // 格式化数据大小显示
  const formatDataSize = (sizeInMb: number) => {
    if (sizeInMb >= 1024) {
      return `${(sizeInMb / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMb} MB`;
  };

  // 计算任务持续时间
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
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
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
                        {/* <div>Input: {formatDataSize(job.inputDataSize)}</div>
                        {job.outputDataSize > 0 && (
                          <div>
                            Output: {formatDataSize(job.outputDataSize)}
                          </div>
                        )} */}
                        {job.errorMessage && (
                          <div className="text-red-600">
                            Error: {job.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {(job.status === "pending" ||
                        job.status === "queued") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runJob(job.id)}
                          title="运行任务"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" title="查看详情">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="编辑任务">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="删除任务">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <EmptyState
                  icon={Activity}
                  title={t('noJobsFound')}
                  description={t('createJobToStart')}
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
