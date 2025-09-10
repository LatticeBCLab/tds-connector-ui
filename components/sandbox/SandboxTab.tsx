"use client";

import { ActionDialog, MetricCard, StatusBadge } from "@/components/shared";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useDataOfferings, useSandbox } from "@/hooks";
import {
  Activity,
  Clock,
  Database,
  Edit,
  Eye,
  Monitor,
  Play,
  Plus,
  Square,
  Trash2,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

export function SandboxTab() {
  const {
    sandboxEnvironments,
    ociImages,
    dataProcessingJobs,
    isCreateSandboxOpen,
    setIsCreateSandboxOpen,
    isCreateJobOpen,
    setIsCreateJobOpen,
    newSandbox,
    setNewSandbox,
    newJob,
    setNewJob,
    createSandbox,
    createJob,
    startSandbox,
    stopSandbox,
    runJob,
    runningSandboxes,
    activeJobs,
    completedJobs,
  } = useSandbox();

  const { dataOfferings } = useDataOfferings();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Running Sandboxes"
          value={runningSandboxes.length}
          description="Active environments"
          icon={Monitor}
          variant="primary"
        />
        <MetricCard
          title="Active Jobs"
          value={activeJobs.length}
          description="Currently processing"
          icon={Activity}
          variant="secondary"
        />
        <MetricCard
          title="Available Images"
          value={ociImages.length}
          description="Runtime images"
          icon={Database}
        />
        <MetricCard
          title="Completed Jobs"
          value={completedJobs.length}
          description="Total processed"
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sandbox Environments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sandbox Environments</CardTitle>
                <CardDescription>
                  Isolated environments for secure data processing
                </CardDescription>
              </div>
              <ActionDialog
                trigger={
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    Create Sandbox
                  </Button>
                }
                title="Create Sandbox Environment"
                description="Set up a new isolated environment for data processing"
                open={isCreateSandboxOpen}
                onOpenChange={setIsCreateSandboxOpen}
                maxWidth="md"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sandbox-name">Environment Name</Label>
                    <Input
                      id="sandbox-name"
                      value={newSandbox.name}
                      onChange={(e) =>
                        setNewSandbox({ ...newSandbox, name: e.target.value })
                      }
                      placeholder="Python Analytics"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="runtime">Runtime</Label>
                      <Select
                        value={newSandbox.runtime}
                        onValueChange={(value) =>
                          setNewSandbox({ ...newSandbox, runtime: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="nodejs">Node.js</SelectItem>
                          <SelectItem value="r">R</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memory-limit">Memory Limit</Label>
                      <Select
                        value={newSandbox.memoryLimit}
                        onValueChange={(value) =>
                          setNewSandbox({ ...newSandbox, memoryLimit: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1GB">1 GB</SelectItem>
                          <SelectItem value="2GB">2 GB</SelectItem>
                          <SelectItem value="4GB">4 GB</SelectItem>
                          <SelectItem value="8GB">8 GB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Container Image</Label>
                    <Select
                      value={newSandbox.image}
                      onValueChange={(value) =>
                        setNewSandbox({ ...newSandbox, image: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select image" />
                      </SelectTrigger>
                      <SelectContent>
                        {ociImages.map((image) => (
                          <SelectItem key={image.id} value={image.name}>
                            {image.name}:{image.tag} ({image.size})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="network-isolated"
                      checked={newSandbox.networkIsolated}
                      onCheckedChange={(checked) =>
                        setNewSandbox({
                          ...newSandbox,
                          networkIsolated: checked,
                        })
                      }
                    />
                    <Label htmlFor="network-isolated">Network Isolation</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateSandboxOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={createSandbox}>Create Sandbox</Button>
                  </div>
                </div>
              </ActionDialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sandboxEnvironments.map((sandbox) => (
                <div key={sandbox.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <h4 className="font-medium">{sandbox.name}</h4>
                        <StatusBadge status={sandbox.status} type="sandbox" />
                      </div>
                      <div className="text-muted-foreground space-y-1 text-sm">
                        <div>
                          Runtime: {sandbox.runtime} | Memory:{" "}
                          {sandbox.memoryLimit}
                        </div>
                        <div>Image: {sandbox.image}</div>
                        <div>
                          CPU: {sandbox.cpuUsage}% | Memory:{" "}
                          {sandbox.memoryUsage}%
                        </div>
                        <div>
                          Created:{" "}
                          {new Date(sandbox.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {sandbox.status === "stopped" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startSandbox(sandbox.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : sandbox.status === "running" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => stopSandbox(sandbox.id)}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      ) : null}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Processing Jobs */}
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
                          {sandboxEnvironments
                            .filter((env) => env.status === "running")
                            .map((sandbox) => (
                              <SelectItem key={sandbox.id} value={sandbox.id}>
                                {sandbox.name} ({sandbox.runtime})
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
            <ScrollArea className="h-96 px-6 pb-6">
              <div className="space-y-3">
                {dataProcessingJobs.map((job) => (
                  <div key={job.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center space-x-2">
                          <h4 className="text-sm font-medium">{job.name}</h4>
                          <StatusBadge status={job.status} type="job" />
                        </div>
                        <div className="text-muted-foreground space-y-1 text-xs">
                          <div>
                            Sandbox:{" "}
                            {
                              sandboxEnvironments.find(
                                (s) => s.id === job.sandboxId
                              )?.name
                            }
                          </div>
                          <div>
                            Started: {new Date(job.startTime).toLocaleString()}
                          </div>
                          {job.endTime && (
                            <div>
                              Ended: {new Date(job.endTime).toLocaleString()}
                            </div>
                          )}
                          <div>Input: {job.inputSize}</div>
                          {job.outputSize && (
                            <div>Output: {job.outputSize}</div>
                          )}
                          {job.errorMessage && (
                            <div className="text-red-600">
                              Error: {job.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {job.status === "queued" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runJob(job.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
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
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Container Images */}
      <Card>
        <CardHeader>
          <CardTitle>Container Images</CardTitle>
          <CardDescription>
            Available runtime environments for data processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ociImages.map((image) => (
              <div key={image.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium">{image.name}</h4>
                  {image.verified && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <span className="text-xs">✓ Verified</span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground mb-2 text-sm">
                  {image.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <div>Runtime: {image.runtime}</div>
                    <div>Size: {image.size}</div>
                    <div>Downloads: {image.downloads}</div>
                  </div>
                  <div className="text-muted-foreground text-right text-xs">
                    <div>Tag: {image.tag}</div>
                    <div>
                      Updated:{" "}
                      {new Date(image.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
