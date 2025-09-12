"use client";

import { ActionDialog, StatusBadge } from "@/components/shared";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Activity, Edit, Eye, Play, Plus, Trash2 } from "lucide-react";

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

interface SandboxEnvironment {
  id: string;
  name: string;
  runtimeType: string;
  status?: string;
}

interface DataOffering {
  id: string;
  title: string;
}

interface DataProcessingJobsCardProps {
  jobs: Job[];
  sandboxes: SandboxEnvironment[];
  dataOfferings: DataOffering[];
  isCreateJobOpen: boolean;
  setIsCreateJobOpen: (open: boolean) => void;
  newJob: any;
  setNewJob: (job: any) => void;
  createJob: () => void;
  runJob: (id: string) => void;
}

export function DataProcessingJobsCard({
  jobs,
  sandboxes,
  dataOfferings,
  isCreateJobOpen,
  setIsCreateJobOpen,
  newJob,
  setNewJob,
  createJob,
  runJob,
}: DataProcessingJobsCardProps) {
  // 格式化数据大小显示
  const formatDataSize = (sizeInMb: number) => {
    if (sizeInMb >= 1024) {
      return `${(sizeInMb / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMb} MB`;
  };

  // 根据sandboxId查找sandbox名称
  const getSandboxName = (sandboxId: string) => {
    const sandbox = sandboxes.find((s) => s.id === sandboxId);
    return sandbox ? sandbox.name : "Unknown Sandbox";
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
            <CardTitle>Data Processing Jobs</CardTitle>
            <CardDescription>Manage data processing tasks</CardDescription>
          </div>
          <ActionDialog
            trigger={
              <Button size="sm" variant="secondary">
                <Plus className="h-4 w-4" />
                New Job
              </Button>
            }
            title="Create Processing Job"
            description="Configure a new data processing task"
            open={isCreateJobOpen}
            onOpenChange={setIsCreateJobOpen}
            maxWidth="lg"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-name">Job Name</Label>
                <Input
                  id="job-name"
                  value={newJob.name}
                  onChange={(e) =>
                    setNewJob({ ...newJob, name: e.target.value })
                  }
                  placeholder="Customer Segmentation Analysis"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-description">Description</Label>
                <Input
                  id="job-description"
                  value={newJob.description}
                  onChange={(e) =>
                    setNewJob({ ...newJob, description: e.target.value })
                  }
                  placeholder="Analyze customer data for segmentation"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sandbox">Sandbox Environment</Label>
                  <Select
                    value={newJob.sandboxId}
                    onValueChange={(value) =>
                      setNewJob({ ...newJob, sandboxId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sandbox" />
                    </SelectTrigger>
                    <SelectContent>
                      {sandboxes.map((sandbox) => (
                        <SelectItem key={sandbox.id} value={sandbox.id}>
                          {sandbox.name} ({sandbox.runtimeType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-offering">Data Offering</Label>
                  <Select
                    value={newJob.dataOfferingId}
                    onValueChange={(value) =>
                      setNewJob({ ...newJob, dataOfferingId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataOfferings.map((offering) => (
                        <SelectItem key={offering.id} value={offering.id}>
                          {offering.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="script">Processing Script</Label>
                <Textarea
                  id="script"
                  value={newJob.script}
                  onChange={(e) =>
                    setNewJob({ ...newJob, script: e.target.value })
                  }
                  placeholder="import pandas as pd&#10;# Your data processing code here"
                  className="font-mono text-sm"
                  rows={8}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateJobOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={createJob}>Create Job</Button>
              </div>
            </div>
          </ActionDialog>
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
                          Sandbox: {getSandboxName(job.sandboxId)}
                        </div>
                        <div>
                          Created: {new Date(job.createdAt).toLocaleString('zh-CN')}
                        </div>
                        {job.startedAt && (
                          <div>
                            Started: {new Date(job.startedAt).toLocaleString('zh-CN')}
                          </div>
                        )}
                        {job.endedAt && (
                          <div>
                            Ended: {new Date(job.endedAt).toLocaleString('zh-CN')}
                          </div>
                        )}
                        {job.startedAt && (
                          <div>
                            Duration: {getJobDuration(job.startedAt, job.endedAt)}
                          </div>
                        )}
                        <div>Input: {formatDataSize(job.inputDataSize)}</div>
                        {job.outputDataSize > 0 && (
                          <div>Output: {formatDataSize(job.outputDataSize)}</div>
                        )}
                        {job.errorMessage && (
                          <div className="text-red-600">
                            Error: {job.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {(job.status === "pending" || job.status === "queued") && (
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
              <div className="text-center py-8 text-muted-foreground">
                <EmptyState 
                  icon={Activity} 
                  title="No processing jobs found" 
                  description="Create one to start processing data." 
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
