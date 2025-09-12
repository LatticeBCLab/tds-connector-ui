"use client";

import { ActionDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDataSpace } from "@/lib/contexts/DataSpaceContext";
import { useCreateJob } from "@/lib/gen/hooks/useCreateJob";
import { useGetResourceListByDataspaceAndPublisher } from "@/lib/gen/hooks/useGetResourceListByDataspaceAndPublisher";
import { useListApps } from "@/lib/gen/hooks/useListApps";
import { useListSandboxes } from "@/lib/gen/hooks/useListSandboxes";
import { modelsJobStatus } from "@/lib/gen/types/models/JobStatus";
import { useAppStore } from "@/lib/stores/app-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslations } from "next-intl";

// Form validation schema
const createJobSchema = z.object({
  name: z.string().min(1, "Job name is required"),
  description: z.string().optional(),
  appId: z.string().min(1, "App is required"),
  sandboxId: z.string().min(1, "Sandbox is required"),
  resourceId: z.string().min(1, "Resource is required"),
  processingScript: z.string().optional(),
});

type CreateJobFormData = z.infer<typeof createJobSchema>;

interface CreateJobDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateJobDialog({ trigger, onSuccess }: CreateJobDialogProps) {
  const t = useTranslations('Sandbox.CreateJobDialog');
  const [open, setOpen] = useState(false);
  const { currentDataSpace } = useDataSpace();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      name: "",
      description: "",
      appId: "",
      sandboxId: "",
      resourceId: "",
      processingScript: "",
    },
  });

  // Watch selectedSandbox to get connectorDid
  const selectedSandboxId = watch("sandboxId");

  // API hooks
  const { data: appsData, isLoading: appsLoading } = useListApps({
    dataspace_id: currentDataSpace?.id || "",
  });

  // Get connector DID from environment variable (same as other components)
  const { data: sandboxesData, isLoading: sandboxesLoading } = useListSandboxes({
    connector_did: process.env.NEXT_PUBLIC_CONNECTOR_DID || "",
  });

  const { currentDataSpaceId } = useAppStore();
  const { data: resourcesData, isLoading: resourcesLoading } = useGetResourceListByDataspaceAndPublisher({
    page: 1,
    page_size: 100,
    dataspace: currentDataSpaceId || "",
  });
  console.log(resourcesData);

  const createJobMutation = useCreateJob({
    mutation: {
      onSuccess: () => {
        toast.success("Job created successfully");
        reset();
        setOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error("Failed to create job");
        console.error("Create job error:", error);
      },
    },
  });

  // Get connector DID from selected sandbox
  const selectedSandbox = useMemo(() => {
    return sandboxesData?.data?.find((sandbox: any) => sandbox.id === selectedSandboxId);
  }, [sandboxesData, selectedSandboxId]);

  const onSubmit = async (data: CreateJobFormData) => {
    if (!selectedSandbox?.connectorDid) {
      toast.error("Selected sandbox does not have a connector DID");
      return;
    }

    try {
      await createJobMutation.mutateAsync({
        data: {
          name: data.name,
          description: data.description,
          appId: data.appId,
          sandboxId: data.sandboxId,
          resourceId: data.resourceId,
          processingScript: data.processingScript,
          connectorDid: selectedSandbox.connectorDid,
          configuration: "{}", // Default empty configuration
          inputDataSize: 0, // Default value
          status: modelsJobStatus.JobStatusPending, // Default status
        },
      });
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const defaultTrigger = (
    <Button size="sm" variant="secondary">
      <Plus className="h-4 w-4" />
      {t('newJob')}
    </Button>
  );

  return (
    <ActionDialog
      trigger={trigger || defaultTrigger}
      title={t('title')}
      description={t('description')}
      open={open}
      onOpenChange={setOpen}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('jobName')}</Label>
          <Input
            id="name"
            className="border-border"
            {...register("name")}
            placeholder={t('jobNamePlaceholder')}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('descriptionLabel')}</Label>
          <Input
            id="description"
            className="border-border"
            {...register("description")}
            placeholder={t('descriptionPlaceholder')}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="app">{t('application')}</Label>
            <Select
              value={watch("appId")}
              onValueChange={(value) => setValue("appId", value)}
            >
              <SelectTrigger className="border-border">
                <SelectValue placeholder={t('selectApplication')} />
              </SelectTrigger>
              <SelectContent>
                {appsLoading ? (
                  <SelectItem value="loading" disabled>
                    {t('loadingApplications')}
                  </SelectItem>
                ) : (
                  appsData?.data?.map((app: any) => (
                    <SelectItem key={app.id} value={app.id || ""}>
                      {app.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.appId && (
              <p className="text-sm text-red-600">{errors.appId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sandbox">{t('sandboxEnvironment')}</Label>
            <Select
              value={watch("sandboxId")}
              onValueChange={(value) => setValue("sandboxId", value)}
            >
              <SelectTrigger className="border-border">
                <SelectValue placeholder={t('selectSandbox')} />
              </SelectTrigger>
              <SelectContent>
                {sandboxesLoading ? (
                  <SelectItem value="loading" disabled>
                    {t('loadingSandboxes')}
                  </SelectItem>
                ) : (
                  sandboxesData?.data?.map((sandbox: any) => (
                    <SelectItem key={sandbox.id} value={sandbox.id || ""}>
                      {sandbox.name} ({sandbox.runtimeType})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.sandboxId && (
              <p className="text-sm text-red-600">{errors.sandboxId.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resource">{t('dataResource')}</Label>
          <Select
            value={watch("resourceId")}
            onValueChange={(value) => setValue("resourceId", value)}
          >
            <SelectTrigger className="border-border">
              <SelectValue placeholder={t('selectDataResource')} />
            </SelectTrigger>
            <SelectContent>
              {resourcesLoading ? (
                <SelectItem value="loading" disabled>
                  {t('loadingResources')}
                </SelectItem>
              ) : (
                resourcesData?.data?.map((resource: any ) => (
                  <SelectItem key={resource.id} value={resource.id || ""}>
                    {resource.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.resourceId && (
            <p className="text-sm text-red-600">{errors.resourceId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="script">{t('processingScript')}</Label>
          <Textarea
            id="script"
            {...register("processingScript")}
            placeholder={t('processingScriptPlaceholder')}
            className="font-mono text-sm border-border"
            rows={8}
          />
          {errors.processingScript && (
            <p className="text-sm text-red-600">{errors.processingScript.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('creating') : t('createJob')}
          </Button>
        </div>
      </form>
    </ActionDialog>
  );
}
