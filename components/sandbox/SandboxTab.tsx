"use client";

import { MetricCard } from "@/components/shared";
import { useDataOfferings, useSandbox } from "@/hooks";
import { useDataSpace } from "@/lib/contexts/DataSpaceContext";
import { useGetSandboxStats } from "@/lib/gen/hooks/useGetSandboxStats";
import { useListApps } from "@/lib/gen/hooks/useListApps";
import { useListJobs } from "@/lib/gen/hooks/useListJobs";
import { useListSandboxes } from "@/lib/gen/hooks/useListSandboxes";
import { Activity, Clock, Database, Monitor } from "lucide-react";
import { AppsCard } from "./AppsCard";
import { DataProcessingJobsCard } from "./DataProcessingJobsCard";
import { SandboxEnvironmentsCard } from "./SandboxEnvironmentsCard";

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
  const { currentDataSpace } = useDataSpace();

  const { data: sandboxStats } = useGetSandboxStats({
    connector_did: process.env.NEXT_PUBLIC_CONNECTOR_DID || "",
  });

  const { data: sandboxList } = useListSandboxes({
    connector_did: process.env.NEXT_PUBLIC_CONNECTOR_DID || "",
    page: 1,
    page_size: 10,
  });

  const { data: jobsList } = useListJobs({
    connector_did: process.env.NEXT_PUBLIC_CONNECTOR_DID || "",
    page: 1,
    page_size: 10,
  });

  const { data: appsList } = useListApps({
    dataspace_id: currentDataSpace?.id || "",
    page: 1,
    page_size: 20,
  });

  console.log(sandboxStats);
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Running Sandboxes"
          value={sandboxStats?.runningSandboxes || 0}
          description="Active environments"
          icon={Monitor}
          variant="primary"
        />
        <MetricCard
          title="Active Jobs"
          value={sandboxStats?.rSandboxes || 0}
          description="Currently processing"
          icon={Activity}
          variant="secondary"
        />
        <MetricCard
          title="Available Images"
          value={sandboxStats?.runningSandboxes || 0}
          description="Runtime images"
          icon={Database}
        />
        <MetricCard
          title="Completed Jobs"
          value={sandboxStats?.totalSandboxes || 0}
          description="Total processed"
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sandbox Environments */}
        <SandboxEnvironmentsCard
          sandboxes={sandboxList?.data || []}
          isCreateSandboxOpen={isCreateSandboxOpen}
          setIsCreateSandboxOpen={setIsCreateSandboxOpen}
          newSandbox={newSandbox}
          setNewSandbox={setNewSandbox}
          createSandbox={createSandbox}
          startSandbox={startSandbox}
          stopSandbox={stopSandbox}
          ociImages={ociImages}
        />

        {/* Data Processing Jobs */}
        <DataProcessingJobsCard
          jobs={jobsList?.data || []}
          sandboxes={sandboxList?.data || []}
          dataOfferings={dataOfferings}
          isCreateJobOpen={isCreateJobOpen}
          setIsCreateJobOpen={setIsCreateJobOpen}
          newJob={newJob}
          setNewJob={setNewJob}
          createJob={createJob}
          runJob={runJob}
        />
      </div>

      {/* Container Images */}
      <AppsCard apps={appsList?.data || []} />
    </div>
  );
}
