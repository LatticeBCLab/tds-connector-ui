"use client";

import { ActionDialog, MetricCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDataOfferings } from "@/hooks";
import type { DataContract } from "@/types";
import { Activity, Database, ExternalLink, Users } from "lucide-react";
import { CatalogCard } from "./CatalogCard";
import { ConnectorCard } from "./ConnectorCard";
import { ContractCard } from "./ContractCard";

export function DataConsumptionTab() {
  const {
    dataRequests,
    dataContracts,
    externalOfferings,
    isRequestDataOpen,
    setIsRequestDataOpen,
    selectedOffering,
    setSelectedOffering,
    newRequest,
    setNewRequest,
    requestData,
  } = useDataOfferings();

  const activeContractsCount = dataContracts.filter(
    (c: DataContract) => c.status === "active" || c.status === "in_use"
  ).length;

  // Handle request for data access
  const handleRequestData = (offering: any) => {
    setSelectedOffering(offering);
    setIsRequestDataOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Available Data"
          value={externalOfferings.length}
          description="External offerings"
          icon={Database}
          variant="primary"
        />
        <MetricCard
          title="Active Contracts"
          value={activeContractsCount}
          description="In use/active"
          icon={Activity}
          variant="secondary"
        />
        <MetricCard
          title="Connected Partners"
          value={0}
          description="Trusted connectors"
          icon={Users}
        />
        <MetricCard
          title="Total Contracts"
          value={dataContracts.length}
          description="All time"
          icon={ExternalLink}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Data Catalog */}
        <CatalogCard />

        {/* Data Contract */}
        <ContractCard />
      </div>

      {/* Connected Connectors */}
      <ConnectorCard />

      {/* Data Request Dialog */}
      <ActionDialog
        trigger={null}
        title="Request Data Access"
        description={
          selectedOffering
            ? `Request access to "${selectedOffering.title}" from ${selectedOffering.provider}`
            : undefined
        }
        open={isRequestDataOpen}
        onOpenChange={setIsRequestDataOpen}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-mode">Access Mode</Label>
            <Select
              value={newRequest.accessMode}
              onValueChange={(value: "api" | "download") =>
                setNewRequest({ ...newRequest, accessMode: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">API Access</SelectItem>
                <SelectItem value="download">Download</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              value={newRequest.purpose}
              onChange={(e) =>
                setNewRequest({ ...newRequest, purpose: e.target.value })
              }
              placeholder="Describe the intended use of this data..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsRequestDataOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={requestData}>Submit Request</Button>
          </div>
        </div>
      </ActionDialog>
    </div>
  );
}
