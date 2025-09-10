"use client";

import {
  ActionDialog,
  MetricCard,
  SecurityRatingChart,
  StatusBadge,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDataOfferings, useIdentity } from "@/hooks";
import { cn } from "@/lib/utils";
import type { DataContract } from "@/types";
import {
  Activity,
  Building,
  Calendar,
  Database,
  ExternalLink,
  Mail,
  MapPin,
  Shield,
  Users,
} from "lucide-react";
import { CatalogCard } from "./CatalogCard";
import { ContractCard } from "./ContractCard";

export function DataConsumptionTab() {
  const { connectedConnectors } = useIdentity();

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
          value={
            connectedConnectors.filter((c) => c.status === "connected").length
          }
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
      <Card>
        <CardHeader>
          <CardTitle>Connected Connectors</CardTitle>
          <CardDescription>
            Manage your trusted connector relationships with security
            assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {connectedConnectors.map((connector) => (
              <div
                key={connector.id}
                className="space-y-4 rounded-lg border p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center space-x-2">
                      <h4 className="text-lg font-semibold">
                        {connector.name}
                      </h4>
                      <StatusBadge status={connector.status} />
                    </div>
                    {connector.organization && (
                      <div className="text-muted-foreground mb-1 flex items-center space-x-1 text-sm">
                        <Building className="h-3 w-3" />
                        <span>{connector.organization}</span>
                      </div>
                    )}
                    {connector.location && (
                      <div className="text-muted-foreground mb-1 flex items-center space-x-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        <span>{connector.location}</span>
                      </div>
                    )}
                    {connector.contactEmail && (
                      <div className="text-muted-foreground flex items-center space-x-1 text-sm">
                        <Mail className="h-3 w-3" />
                        <span>{connector.contactEmail}</span>
                      </div>
                    )}
                  </div>
                  {connector.securityAssessment && (
                    <div className="flex flex-col items-center space-y-2">
                      <SecurityRatingChart
                        assessment={connector.securityAssessment}
                        size="md"
                        showModal={true}
                      />
                      <Badge
                        className={cn(
                          "text-xs text-white",
                          connector.securityAssessment.rating === "S" &&
                            "bg-green-600",
                          connector.securityAssessment.rating === "A" &&
                            "bg-green-500",
                          connector.securityAssessment.rating === "B" &&
                            "bg-yellow-500",
                          connector.securityAssessment.rating === "C" &&
                            "bg-orange-500",
                          connector.securityAssessment.rating === "D" &&
                            "bg-red-500"
                        )}
                      >
                        Security Rating {connector.securityAssessment.rating}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Description */}
                {connector.description && (
                  <p className="text-muted-foreground text-sm">
                    {connector.description}
                  </p>
                )}

                {/* DID */}
                <div className="bg-muted rounded-md py-3">
                  <div className="text-muted-foreground mb-1 text-xs">DID:</div>
                  <p className="font-mono text-sm break-all">{connector.did}</p>
                </div>

                {/* Data Categories */}
                {connector.dataCategories &&
                  connector.dataCategories.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-2 text-xs">
                        Data Categories:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {connector.dataCategories.map((category, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Certifications */}
                {connector.certifications &&
                  connector.certifications.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-2 text-xs">
                        Certifications:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {connector.certifications.map((cert, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            <Shield className="mr-1 h-3 w-3" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 border-t pt-3">
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {connector.offeringsCount}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Offerings
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {new Date(connector.lastSeen).toLocaleDateString()}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Last Seen
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      {connector.securityAssessment && (
                        <div className="text-sm font-medium">
                          {new Date(
                            connector.securityAssessment.lastAssessed
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Security Review
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
