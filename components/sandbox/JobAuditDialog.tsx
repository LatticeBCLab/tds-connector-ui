"use client";

import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import { useApproveJob } from "@/lib/gen/hooks/useApproveJob";
import { useCreateResource } from "@/lib/gen/hooks/useCreateResource";
import { useGetResourceByID } from "@/lib/gen/hooks/useGetResourceByID";
import { useRejectJob } from "@/lib/gen/hooks/useRejectJob";
import { useAppStore } from "@/lib/stores/app-store";
import { useState } from "react";
import { toast } from "sonner";

interface JobAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    id: string;
    name: string;
    description: string;
    resource_id: string;
  };
  onSuccess?: () => void;
}

export function JobAuditDialog({
  open,
  onOpenChange,
  job,
  onSuccess,
}: JobAuditDialogProps) {
  const { currentDataSpaceId } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const approveJobMutation = useApproveJob();
  const rejectJobMutation = useRejectJob();
  const createResourceMutation = useCreateResource();

  // Fetch resource details to get originCountry
  const { data: resourceData } = useGetResourceByID(job.resource_id);

  const handleApprove = async () => {
    try {
      setIsProcessing(true);

      // Step 1: Approve the job
      await approveJobMutation.mutateAsync({ id: job.id });
      toast.success("Job approved successfully");

      // Step 2: Create resource after approval
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
        originResource: [job.resource_id],
        publisher,
        status: "Active" as any,
        title: job.name,
        type: "LocalFile" as any,
      };

      await createResourceMutation.mutateAsync({ data: newResourceData });

      // Close dialog and refresh
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error approving job:", error);
      toast.error("Failed to approve job");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);

      await rejectJobMutation.mutateAsync({ id: job.id });
      toast.success("Job rejected successfully");

      // Close dialog and refresh
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error rejecting job:", error);
      toast.error("Failed to reject job");
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading =
    approveJobMutation.isPending ||
    rejectJobMutation.isPending ||
    createResourceMutation.isPending ||
    isProcessing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Job Audit Decision</DialogTitle>
          <DialogDescription>
            Please review and make a decision for this processing job.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job Details */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm font-medium">
              Job Name
            </Label>
            <Input
              value={job.name}
              readOnly
              className="border-border bg-muted/50 text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm font-medium">
              Description
            </Label>
            <Input
              value={job.description}
              readOnly
              className="border-border bg-muted/50 text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm font-medium">
              Resource ID
            </Label>
            <Input
              value={job.resource_id}
              readOnly
              className="border-border bg-muted/50 text-muted-foreground font-mono"
            />
          </div>
          {resourceData && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm font-medium">
                Origin Country
              </Label>
              <Input
                value={resourceData.originCountry}
                readOnly
                className="border-border bg-muted/50 text-muted-foreground"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-center space-x-3">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isLoading}
            className="flex-1"
          >
            {rejectJobMutation.isPending ? (
              <>
                <Spinner variant="circle" className="h-4 w-4" />
                Rejecting...
              </>
            ) : (
              <>Reject</>
            )}
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isLoading}
            className="flex-1"
          >
            {approveJobMutation.isPending ||
            createResourceMutation.isPending ||
            isProcessing ? (
              <>
                <Spinner variant="circle" className="h-4 w-4" />
                Approving...
              </>
            ) : (
              <>Approve</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
