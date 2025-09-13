import { Badge } from "@/components/ui/badge";
import { memo } from "react";

export interface StatusBadgeProps {
  status: string;
  type?: "default" | "contract" | "sandbox" | "job" | "health" | "audit";
  className?: string;
}

export const StatusBadge = memo(function StatusBadge({
  status,
  type = "default",
  className,
}: StatusBadgeProps) {
  const getStatusColor = (status: string, type: string) => {
    switch (type) {
      case "contract":
        switch (status) {
          case "active":
            return "default";
          case "pending":
          case "draft":
            return "secondary";
          case "expired":
          case "terminated":
            return "outline";
          case "violated":
            return "destructive";
          default:
            return "outline";
        }

      case "sandbox":
        switch (status) {
          case "RUNNING":
            return "default";
          case "STOPPED":
          case "CREATING":
            return "secondary";
          case "DESTROYING":
          case "ERROR":
            return "destructive";
          default:
            return "outline";
        }

      case "job":
        switch (status) {
          case "COMPLETED":
            return "default";
          case "RUNNING":
            return "secondary";
          case "QUEUED":
            return "outline";
          case "FAILED":
          case "CANCELLED":
            return "destructive";
          default:
            return "outline";
        }

      case "health":
        switch (status) {
          case "healthy":
            return "default";
          case "warning":
            return "secondary";
          case "critical":
          case "offline":
            return "destructive";
          default:
            return "outline";
        }

      case "audit":
        switch (status) {
          case "approved":
          case "passed":
            return "default";
          case "pending":
          case "in_progress":
            return "secondary";
          case "rejected":
          case "failed":
          case "denied":
            return "destructive";
          case "requires_attention":
            return "outline";
          default:
            return "outline";
        }

      default:
        switch (status) {
          case "approved":
          case "connected":
          case "active":
            return "default";
          case "pending":
            return "secondary";
          case "rejected":
          case "disconnected":
          case "inactive":
            return "destructive";
          default:
            return "outline";
        }
    }
  };

  return (
    <Badge variant={getStatusColor(status, type) as any} className={className}>
      {status}
    </Badge>
  );
});
