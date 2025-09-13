"use client";

import { MetricCard } from "@/components/shared";
import { useDataOfferings, useSandbox } from "@/hooks";
import { useDataSpace } from "@/lib/contexts/DataSpaceContext";
import { useGetSandboxStats } from "@/lib/gen/hooks/useGetSandboxStats";
import { useListApps } from "@/lib/gen/hooks/useListApps";
import { useListJobs } from "@/lib/gen/hooks/useListJobs";
import { useListSandboxes } from "@/lib/gen/hooks/useListSandboxes";
import { Activity, Clock, Database, Monitor } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppsCard } from "./AppsCard";
import { DataProcessingJobsCard } from "./DataProcessingJobsCard";
import { SandboxEnvironmentsCard } from "./SandboxEnvironmentsCard";

export function SandboxTab() {
  const t = useTranslations('Sandbox.SandboxTab');
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
          title={t("runningSandboxes")}
          value={sandboxStats?.runningSandboxes || 0}
          description={t("activeEnvironments")}
          icon={Monitor}
          variant="primary"
        />
        <MetricCard
          title={t("activeJobs")}
          value={sandboxStats?.rSandboxes || 0}
          description={t("currentlyProcessing")}
          icon={Activity}
          variant="secondary"
        />
        <MetricCard
          title={t("availableImages")}
          value={sandboxStats?.runningSandboxes || 0}
          description={t("runtimeImages")}
          icon={Database}
        />
        <MetricCard
          title={t("completedJobs")}
          value={sandboxStats?.totalSandboxes || 0}
          description={t("totalProcessed")}
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
          runJob={runJob}
          onJobCreated={() => {
            // 当任务创建成功后，重新获取任务列表（可选，因为我们已经在 CreateJobDialog 中处理了）
            // 这里可以添加额外的逻辑，比如显示通知等
            console.log("Job created successfully");
          }}
        />
      </div>

      {/* Container Images */}
      <AppsCard apps={appsList?.data || []} />
    </div>
  );
}
