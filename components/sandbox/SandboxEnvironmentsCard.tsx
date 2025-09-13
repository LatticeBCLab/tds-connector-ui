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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Database, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface SandboxEnvironment {
  id: string;
  name: string;
  description: string;
  status: string;
  connectorDid: string;
  dataSpaceId: string;
  runtimeType: string;
  runtimeVersion: string;
  baseImage: string;
  cpuCores: number;
  memoryMb: number;
  storageGb: number;
  securityLevel: string;
  cpuUsage: number;
  memoryUsage: number;
  lastActivity: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

interface SandboxEnvironmentsCardProps {
  sandboxes: SandboxEnvironment[];
  isCreateSandboxOpen: boolean;
  setIsCreateSandboxOpen: (open: boolean) => void;
  newSandbox: any;
  setNewSandbox: (sandbox: any) => void;
  createSandbox: () => void;
  startSandbox: (id: string) => void;
  stopSandbox: (id: string) => void;
  ociImages: any[];
}

export function SandboxEnvironmentsCard({
  sandboxes,
  isCreateSandboxOpen,
  setIsCreateSandboxOpen,
  newSandbox,
  setNewSandbox,
  createSandbox,
  startSandbox,
  stopSandbox,
  ociImages,
}: SandboxEnvironmentsCardProps) {
  const t = useTranslations("Sandbox.SandboxEnvironmentsCard");
  const formatMemory = (memoryMb: number) => {
    if (memoryMb >= 1024) {
      return `${(memoryMb / 1024).toFixed(1)} GB`;
    }
    return `${memoryMb} MB`;
  };

  const formatStorage = (storageGb: number) => {
    return `${storageGb} GB`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <ActionDialog
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4" />
                {t("createSandbox")}
              </Button>
            }
            title={t("createSandboxTitle")}
            description={t("createSandboxDescription")}
            open={isCreateSandboxOpen}
            onOpenChange={setIsCreateSandboxOpen}
            maxWidth="md"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sandbox-name">{t("environmentName")}</Label>
                <Input
                  id="sandbox-name"
                  className="border-border"
                  value={newSandbox.name}
                  onChange={(e) =>
                    setNewSandbox({ ...newSandbox, name: e.target.value })
                  }
                  placeholder={t("environmentNamePlaceholder")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="runtime">{t("runtime")}</Label>
                  <Select
                    value={newSandbox.runtime}
                    onValueChange={(value) =>
                      setNewSandbox({ ...newSandbox, runtime: value })
                    }
                  >
                    <SelectTrigger className="border-border w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="nodejs">Node.js</SelectItem>
                      <SelectItem value="r">R</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memory-limit">{t("memoryLimit")}</Label>
                  <Select
                    value={newSandbox.memoryLimit}
                    onValueChange={(value) =>
                      setNewSandbox({ ...newSandbox, memoryLimit: value })
                    }
                  >
                    <SelectTrigger className="border-border w-full">
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
                <Label htmlFor="image">{t("containerImage")}</Label>
                <Select
                  value={newSandbox.image}
                  onValueChange={(value) =>
                    setNewSandbox({ ...newSandbox, image: value })
                  }
                >
                  <SelectTrigger className="border-border w-full">
                    <SelectValue placeholder={t("selectImage")} />
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
                <Label htmlFor="network-isolated">
                  {t("networkIsolation")}
                </Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateSandboxOpen(false)}
                >
                  {t("cancel")}
                </Button>
                <Button onClick={createSandbox}>{t("createSandbox")}</Button>
              </div>
            </div>
          </ActionDialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[480px] px-6 pb-6">
          <div className="space-y-3">
            {sandboxes && sandboxes.length > 0 ? (
              sandboxes.map((sandbox) => (
                <div key={sandbox.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <h4 className="font-medium">{sandbox.name}</h4>
                        <StatusBadge status={sandbox.status} type="sandbox" />
                      </div>
                      <div className="text-muted-foreground space-y-1 text-xs">
                        <div>{sandbox.description}</div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Runtime:
                          </span>
                          <span className="ml-2 truncate font-mono">
                            {sandbox.runtimeType} {sandbox.runtimeVersion}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Image:</span>
                          <span className="ml-2 truncate font-mono">
                            {sandbox.baseImage}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CPU:</span>
                          <span className="ml-2 truncate font-mono">
                            {sandbox.cpuCores} cores ({sandbox.cpuUsage}%)
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Memory:</span>
                          <span className="ml-2 truncate font-mono">
                            {formatMemory(sandbox.memoryMb)} (
                            {sandbox.memoryUsage}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Storage:
                          </span>
                          <span className="ml-2 truncate font-mono">
                            {formatStorage(sandbox.storageGb)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Security:
                          </span>
                          <span className="ml-2 truncate font-mono">
                            {sandbox.securityLevel}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Created:
                          </span>
                          <span className="ml-2 truncate font-mono">
                            {new Date(sandbox.createdAt).toLocaleDateString(
                              "zh-CN"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* <div className="flex items-center space-x-1">
                      {sandbox.status === "stopped" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startSandbox(sandbox.id)}
                          title="启动沙箱"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : sandbox.status === "running" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => stopSandbox(sandbox.id)}
                          title="停止沙箱"
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      ) : null}
                      <Button variant="ghost" size="sm" title="查看详情">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="删除沙箱">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div> */}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <EmptyState
                  icon={Database}
                  title={t("noSandboxFound")}
                  description={t("createOneToGetStarted")}
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
