"use client";

import { MetricCard, StatusBadge } from "@/components/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGetMetric, useListAlters } from "@/lib/gen";
import { useStats } from "@/lib/gen/hooks/useStats";
import { Activity, AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { useEffect } from "react";
import { ScrollArea } from "../ui/scroll-area";

export function MonitoringTab() {
  const { data: alterList } = useListAlters();
  const { data: latestMetrics, refetch } = useGetMetric();
  const { data: statsData } = useStats();

  // Extract stats data
  const totalAlerts = statsData?.data?.total_alerts ?? 0;
  const criticalAlerts = statsData?.data?.critical_alerts ?? 0;
  const unresolvedIssues = statsData?.data?.unresolved_issues ?? 0;

  useEffect(() => {
    const handler = () => refetch();
    const timer = setInterval(handler, 2_000);
    return () => clearInterval(timer);
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Alerts"
          value={totalAlerts}
          description="All system alerts"
          icon={Shield}
          variant="primary"
        />
        <MetricCard
          title="Critical Alerts"
          value={criticalAlerts}
          description="Require attention"
          icon={AlertTriangle}
          variant={criticalAlerts > 0 ? "secondary" : "default"}
        />
        <MetricCard
          title="System Performance"
          value="Optimal"
          description="Performance metrics"
          icon={Activity}
        />
        <MetricCard
          title="Unresolved Issues"
          value={unresolvedIssues}
          description="Outstanding issues"
          icon={CheckCircle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Metrics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>System Metrics</CardTitle>
                <CardDescription>
                  Real-time system performance indicators
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {latestMetrics && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-muted-foreground text-sm">
                      {latestMetrics.cpuPercent}%
                    </span>
                  </div>
                  <Progress value={latestMetrics.cpuPercent} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-muted-foreground text-sm">
                      {latestMetrics.memPercent}%
                    </span>
                  </div>
                  <Progress value={latestMetrics.memPercent} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <span className="text-muted-foreground text-sm">
                      {latestMetrics.diskPercent}%
                    </span>
                  </div>
                  <Progress value={latestMetrics.diskPercent} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Network In</div>
                    <div className="text-2xl font-bold text-green-600">
                      {latestMetrics.netInBytes} KB/s
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Network Out</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {latestMetrics.netOutBytes} KB/s
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Security Alerts</CardTitle>
            <CardDescription>Security events and system alerts</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96 px-6 pb-6">
              <div className="space-y-3">
                {(alterList || []).map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-3 ${
                      alert.resolved ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center space-x-2">
                          <h4 className="text-sm font-medium">
                            {alert.metric} {alert.severity}
                          </h4>
                          {alert.resolved && (
                            <StatusBadge
                              status="resolved"
                              className="text-xs"
                            />
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2 text-xs">
                          {alert.message}
                        </p>
                        <div className="text-muted-foreground flex items-center space-x-4 text-xs">
                          <span>
                            {new Date(alert.firstSeen!).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
