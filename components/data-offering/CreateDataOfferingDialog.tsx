"use client";

import { ActionDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCreateResource, useGetDataSpaceByID } from "@/lib/gen";
import {
  createDataOfferingSchema,
  getDefaultValues,
  type CreateDataOfferingFormData,
} from "@/lib/schemas/data-offering";
import { useAppStore } from "@/lib/stores/app-store";
import { DataSourceType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cloud, File, Link, Plus, Server } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CreateDataOfferingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateDataOfferingDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateDataOfferingDialogProps) {
  const t = useTranslations("createDataOfferingDialog");
  // Get store values
  const { userDID, currentDataSpaceId } = useAppStore();

  // API hooks
  const createResourceMutation = useCreateResource();
  const { data: dataSpace } = useGetDataSpaceByID(currentDataSpaceId || "", {
    query: {
      enabled: !!currentDataSpaceId,
    },
  });

  const form = useForm<CreateDataOfferingFormData>({
    resolver: zodResolver(createDataOfferingSchema),
    defaultValues: getDefaultValues("s3"), // Default to S3 as requested
  });

  // Watch dataType changes
  const watchedDataType = form.watch("dataType");

  const handleDataTypeChange = useCallback(
    (newDataType: DataSourceType) => {
      // Reset form to new data type's default values
      const newDefaults = getDefaultValues(newDataType);
      form.reset(newDefaults);
    },
    [form]
  );

  // Watch dialog open/close state, reset form
  useEffect(() => {
    if (!open) {
      form.reset(getDefaultValues("s3"));
    }
  }, [open, form]);

  const onSubmit = async (data: CreateDataOfferingFormData) => {
    try {
      if (!userDID) {
        toast.error(t("errors.userNotLoggedIn"));
        return;
      }

      if (!currentDataSpaceId) {
        toast.error(t("errors.selectDataSpaceFirst"));
        return;
      }

      if (!dataSpace) {
        toast.error(t("errors.unableToRetrieveDataSpace"));
        return;
      }

      // Map form data to API request format
      const location = process.env.NEXT_PUBLIC_LOCATION;
      const originCountry = dataSpace.country;

      // Generate config JSON based on data type
      let config: any = {};
      const fileSize = Math.floor(Math.random() * 100000000) + 1000000; // Random file size 1MB-100MB

      switch (data.dataType) {
        case "s3":
          config = {
            region: data.sourceConfig.region,
            fileSize,
            bucketName: data.sourceConfig.bucketName,
            fileFormat: data.sourceConfig.fileFormat,
            objectName: data.sourceConfig.objectName,
          };
          break;
        case "local_file":
          config = {
            filePath: data.sourceConfig.filePath,
            format: data.sourceConfig.format,
            fileSize,
          };
          break;
        case "nas":
          config = {
            serverAddress: data.sourceConfig.serverAddress,
            sharePath: data.sourceConfig.sharePath,
            protocol: data.sourceConfig.protocol,
            fileSize,
          };
          break;
        case "restful":
          config = {
            apiEndpoint: data.sourceConfig.apiEndpoint,
            method: data.sourceConfig.method,
            authentication: data.sourceConfig.authentication,
          };
          break;
      }

      // Map data type to API type
      const typeMap = {
        local_file: "LocalFile",
        s3: "S3",
        nas: "NAS",
        restful: "RESTful",
      } as const;

      const requestData = {
        title: data.title,
        description: data.description,
        dataspace: currentDataSpaceId,
        location: location as any,
        originCountry: originCountry as any,
        publisher: userDID,
        status: data.status as any,
        type: typeMap[data.dataType] as any,
        config,
      };

      await createResourceMutation.mutateAsync({ data: requestData });

      toast.success(t("success.dataOfferingCreated"));
      onSuccess?.();
      onOpenChange(false);
      form.reset(getDefaultValues("s3"));
    } catch (error) {
      console.error("Error creating resource:", error);
      toast.error(t("errors.createFailed"));
    }
  };

  return (
    <ActionDialog
      trigger={
        <Button size="sm">
          <Plus className="h-4 w-4" />
          {t("trigger.addDataOffering")}
        </Button>
      }
      title={t("title")}
      description={t("description")}
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="md"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Base information fields */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="offering-title">{t("fields.title.label")}</FormLabel>
                <FormControl>
                  <Input
                    className="border-border"
                    id="offering-title"
                    placeholder={t("fields.title.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="offering-description">
                  {t("fields.description.label")}
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="border-border"
                    id="offering-description"
                    placeholder={t("fields.description.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Read-only fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Location
              </label>
              <Input
                value={process.env.NEXT_PUBLIC_LOCATION}
                readOnly
                className="border-border bg-muted/50 text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Origin Country
              </label>
              <Input
                value={dataSpace?.country}
                readOnly
                className="border-border bg-muted/50 text-muted-foreground"
              />
            </div>
          </div>
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Publisher
            </label>
            <Input
              value={userDID || ""}
              readOnly
              className="border-border bg-muted/50 text-muted-foreground"
            />
          </div>
          <div className="flex justify-between gap-4">
            <FormField
              control={form.control}
              name="dataType"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel htmlFor="data-type">{t("fields.dataType.label")}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value: DataSourceType) => {
                      field.onChange(value);
                      handleDataTypeChange(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="border-border">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="local_file">
                        <div className="flex items-center space-x-2">
                          <File className="h-4 w-4" />
                          <span>Local File</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="s3">
                        <div className="flex items-center space-x-2">
                          <Cloud className="h-4 w-4" />
                          <span>S3 Storage</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="nas">
                        <div className="flex items-center space-x-2">
                          <Server className="h-4 w-4" />
                          <span>NAS Storage</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="restful">
                        <div className="flex items-center space-x-2">
                          <Link className="h-4 w-4" />
                          <span>RESTful API</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel htmlFor="status">{t("fields.status.label")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="border-border">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Render different configuration areas based on data source type */}
          {watchedDataType === "local_file" && (
            <LocalFileConfigSection form={form} />
          )}

          {watchedDataType === "s3" && <S3ConfigSection form={form} />}

          {watchedDataType === "nas" && <NASConfigSection form={form} />}

          {watchedDataType === "restful" && (
            <RESTfulConfigSection form={form} />
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("actions.cancel")}
            </Button>
            <Button type="submit" disabled={createResourceMutation.isPending}>
              {createResourceMutation.isPending ? (
                <>
                  <Spinner variant="circle" />
                  {t("actions.creating")}
                </>
              ) : (
                t("actions.createOffering")
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ActionDialog>
  );
}

// Local file configuration component
function LocalFileConfigSection({ form }: { form: any }) {
  return (
    <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
      <h4 className="font-medium">{t("sections.localFile.title")}</h4>

      <FormField
        control={form.control}
        name="sourceConfig.filePath"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="file-path">{t("fields.filePath.label")}</FormLabel>
            <FormControl>
              <Input
                className="border-border"
                id="file-path"
                placeholder={t("fields.filePath.placeholder")}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sourceConfig.format"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="file-format">{t("fields.fileFormat.label")}</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="border-border">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="CSV">CSV</SelectItem>
                <SelectItem value="JSON">JSON</SelectItem>
                <SelectItem value="XML">XML</SelectItem>
                <SelectItem value="Parquet">Parquet</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// S3 configuration component - simplified without file upload
function S3ConfigSection({ form }: { form: any }) {
  return (
    <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
      <h4 className="font-medium">{t("sections.s3.title")}</h4>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="sourceConfig.bucketName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="bucket-name">{t("fields.bucketName.label")}</FormLabel>
              <FormControl>
                <Input
                  className="border-border"
                  id="bucket-name"
                  placeholder={t("fields.bucketName.placeholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sourceConfig.objectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="object-name">{t("fields.objectName.label")}</FormLabel>
              <FormControl>
                <Input
                  className="border-border"
                  id="object-name"
                  placeholder={t("fields.objectName.placeholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="sourceConfig.region"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="region">{t("fields.region.label")}</FormLabel>
              <FormControl>
                <Input
                  className="border-border"
                  id="region"
                  placeholder={t("fields.region.placeholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sourceConfig.fileFormat"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="file-format">File Format</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CSV">CSV</SelectItem>
                  <SelectItem value="JSON">JSON</SelectItem>
                  <SelectItem value="XML">XML</SelectItem>
                  <SelectItem value="Parquet">Parquet</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// NAS configuration component
function NASConfigSection({ form }: { form: any }) {
  return (
    <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
      <h4 className="font-medium">{t("sections.nas.title")}</h4>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="sourceConfig.serverAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="server-address">{t("fields.serverAddress.label")}</FormLabel>
              <FormControl>
                <Input
                  className="border-border"
                  id="server-address"
                  placeholder={t("fields.serverAddress.placeholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sourceConfig.sharePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="share-path">{t("fields.sharePath.label")}</FormLabel>
              <FormControl>
                <Input
                  className="border-border"
                  id="share-path"
                  placeholder={t("fields.sharePath.placeholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="sourceConfig.protocol"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="protocol">{t("fields.protocol.label")}</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="border-border">
                  <SelectValue placeholder="Select protocol" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="nfs">NFS</SelectItem>
                <SelectItem value="smb">SMB</SelectItem>
                <SelectItem value="ftp">FTP</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// RESTful configuration component
function RESTfulConfigSection({ form }: { form: any }) {
  const watchedAuthType = form.watch("sourceConfig.authentication.type");

  return (
    <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
      <h4 className="font-medium">{t("sections.restful.title")}</h4>

      <FormField
        control={form.control}
        name="sourceConfig.apiEndpoint"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="api-endpoint">{t("fields.apiEndpoint.label")}</FormLabel>
            <FormControl>
              <Input
                className="border-border"
                id="api-endpoint"
                placeholder={t("fields.apiEndpoint.placeholder")}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sourceConfig.method"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="method">{t("fields.method.label")}</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="border-border">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sourceConfig.authentication.type"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="auth-type">{t("fields.authenticationType.label")}</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="border-border">
                  <SelectValue placeholder="Select authentication" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="api_key">API Key</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Basic Authentication Fields */}
      {watchedAuthType === "basic" && (
        <div className="bg-muted/30 space-y-4 rounded border p-3">
          <h5 className="text-sm font-medium">{t("sections.basicAuth.title")}</h5>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="sourceConfig.authentication.credentials.username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="auth-username">{t("fields.username.label")}</FormLabel>
                  <FormControl>
                    <Input
                      className="border-border"
                      id="auth-username"
                      placeholder={t("fields.username.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceConfig.authentication.credentials.password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="auth-password">{t("fields.password.label")}</FormLabel>
                  <FormControl>
                    <Input
                      className="border-border"
                      id="auth-password"
                      type="password"
                      placeholder={t("fields.password.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {/* API Key Authentication Fields */}
      {watchedAuthType === "api_key" && (
        <div className="bg-muted/30 space-y-4 rounded border p-3">
          <h5 className="text-sm font-medium">{t("sections.apiKeyAuth.title")}</h5>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="sourceConfig.authentication.credentials.headerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="header-name">{t("fields.headerName.label")}</FormLabel>
                  <FormControl>
                    <Input
                      className="border-border"
                      id="header-name"
                      placeholder={t("fields.headerName.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceConfig.authentication.credentials.headerValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="header-value">{t("fields.headerValue.label")}</FormLabel>
                  <FormControl>
                    <Input
                      className="border-border"
                      id="header-value"
                      type="password"
                      placeholder={t("fields.headerValue.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}