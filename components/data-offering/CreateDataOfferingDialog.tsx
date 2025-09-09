"use client";

import { ActionDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useFileUpload } from "@/hooks";
import {
  createDataOfferingSchema,
  getDefaultValues,
  type CreateDataOfferingFormData,
} from "@/lib/schemas/data-offering";
import { DataSourceType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  Cloud,
  File,
  ImageUpIcon,
  Link,
  Plus,
  Server,
  XIcon,
} from "lucide-react";
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
  // TODO: Replace with actual API call implementation
  const isCreating = false;

  const form = useForm<CreateDataOfferingFormData>({
    resolver: zodResolver(createDataOfferingSchema),
    defaultValues: getDefaultValues("local_file"),
  });

  // File upload functionality
  const [{ files, isDragging, errors }, fileActions] = useFileUpload({
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onUpload: (uploadedFiles) => {
      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        // Automatically set objectKey to file name
        form.setValue("sourceConfig.objectKey", file.file.name);
        // Store file reference
        form.setValue("sourceConfig.file", file);
      }
    },
  });

  const { clearFiles, ...restFileActions } = fileActions;

  // Watch dataType changes
  const watchedDataType = form.watch("dataType");

  const handleDataTypeChange = useCallback(
    (newDataType: DataSourceType) => {
      // Clean up file upload state (only for S3)
      if (watchedDataType === "s3" && newDataType !== "s3") {
        clearFiles();
      }

      // Reset form to new data type's default values
      const newDefaults = getDefaultValues(newDataType);
      form.reset(newDefaults);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [watchedDataType, form]
  );

  // Watch dialog open/close state, reset form
  useEffect(
    () => {
      if (!open) {
        form.reset(getDefaultValues("local_file"));
        clearFiles();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, form]
  );

  const onSubmit = async (data: CreateDataOfferingFormData) => {
    try {
      // TODO: Replace with actual API call
      console.log("Form data:", data);
      
      // Simulate success behavior for now
      toast.success("Data resource created successfully");
      onSuccess?.();
      onOpenChange(false);
      form.reset();
      clearFiles();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form, please try again");
    }
  };

  return (
    <ActionDialog
      trigger={
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add Offering
        </Button>
      }
      title="Create Data Offering"
      description="Configure a new data resource to share with other connectors"
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
                <FormLabel htmlFor="offering-title">Title</FormLabel>
                <FormControl>
                  <Input
                    className="border-border"
                    id="offering-title"
                    placeholder="Customer Analytics Dataset"
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
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="border-border"
                    id="offering-description"
                    placeholder="Describe your data offering..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between gap-4">
            <FormField
              control={form.control}
              name="dataType"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel htmlFor="data-type">Data Source Type</FormLabel>
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
              name="accessPolicy"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel htmlFor="access-policy">Access Policy</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="border-border">
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Open">Open Access</SelectItem>
                      <SelectItem value="Restricted">
                        Restricted Access
                      </SelectItem>
                      <SelectItem value="Premium">Premium Access</SelectItem>
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

          {watchedDataType === "s3" && (
            <S3ConfigSection
              form={form}
              files={files}
              isDragging={isDragging}
              errors={errors}
              fileActions={restFileActions}
            />
          )}

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
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Data Resource"}
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
      <h4 className="font-medium">Local File Configuration</h4>

      <FormField
        control={form.control}
        name="sourceConfig.filePath"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="file-path">File Path</FormLabel>
            <FormControl>
              <Input
                className="border-border"
                id="file-path"
                placeholder="/path/to/your/file.csv"
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
  );
}

// S3 configuration component
function S3ConfigSection({
  form,
  files,
  isDragging,
  errors,
  fileActions,
}: {
  form: any;
  files: any[];
  isDragging: boolean;
  errors: string[];
  fileActions: any;
}) {
  const maxSizeMB = 10;

  return (
    <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
      <h4 className="font-medium">S3 Storage Configuration</h4>

      {/* File Upload Section */}
      <div className="space-y-2">
        <div className="relative">
          <div
            role="button"
            onClick={fileActions.openFileDialog}
            onDragEnter={fileActions.handleDragEnter}
            onDragLeave={fileActions.handleDragLeave}
            onDragOver={fileActions.handleDragOver}
            onDrop={fileActions.handleDrop}
            data-dragging={isDragging || undefined}
            className="border-border hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
          >
            <input
              {...fileActions.getInputProps()}
              className="sr-only"
              aria-label="Upload file"
            />
            {files.length > 0 ? (
              <div className="flex items-center space-x-2">
                <File className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">
                  {files[0].file.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  ({(files[0].file.size / 1024 / 1024).toFixed(2)}MB)
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                <div
                  className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                  aria-hidden="true"
                >
                  <ImageUpIcon className="size-4 opacity-60" />
                </div>
                <p className="mb-1.5 text-sm font-medium">
                  Drag files here or click to upload.
                </p>
                <p className="text-muted-foreground text-xs">
                  Supported formats: CSV, JSON, XML, Parquet, TXT, Excel, PDF
                  (Max {maxSizeMB}MB)
                </p>
              </div>
            )}
          </div>
          {files.length > 0 && (
            <div className="absolute top-2 right-2">
              <button
                type="button"
                className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                onClick={() => {
                  fileActions.removeFile(files[0].id);
                  form.setValue("sourceConfig.file", undefined);
                }}
                aria-label="Remove file"
              >
                <XIcon className="size-3" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {errors.length > 0 && (
          <div
            className="text-destructive flex items-center gap-1 text-xs"
            role="alert"
          >
            <AlertCircleIcon className="size-3 shrink-0" />
            <span>{errors[0]}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="sourceConfig.bucketName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="bucket-name">Bucket Name</FormLabel>
              <FormControl>
                <Input
                  className="border-border"
                  id="bucket-name"
                  placeholder="my-data-bucket"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sourceConfig.objectKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="object-key">Object Key</FormLabel>
              <FormControl>
                <Input
                  className="border-border"
                  id="object-key"
                  placeholder="data/file.csv"
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
        name="sourceConfig.region"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="region">Region</FormLabel>
            <FormControl>
              <Input
                className="border-border"
                id="region"
                placeholder="us-east-1"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// NAS configuration component
function NASConfigSection({ form }: { form: any }) {
  return (
    <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
      <h4 className="font-medium">NAS Storage Configuration</h4>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="sourceConfig.serverAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="server-address">Server Address</FormLabel>
              <FormControl>
                <Input
                  className="border-border"
                  id="server-address"
                  placeholder="192.168.1.100"
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
              <FormLabel htmlFor="share-path">Share Path</FormLabel>
              <FormControl>
                <Input
                  className="border-border"
                  id="share-path"
                  placeholder="/shared/data"
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
            <FormLabel htmlFor="protocol">Protocol</FormLabel>
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
      <h4 className="font-medium">RESTful API Configuration</h4>

      <FormField
        control={form.control}
        name="sourceConfig.apiEndpoint"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="api-endpoint">API Endpoint</FormLabel>
            <FormControl>
              <Input
                className="border-border"
                id="api-endpoint"
                placeholder="https://api.example.com/data"
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
            <FormLabel htmlFor="method">Request Method</FormLabel>
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
            <FormLabel htmlFor="auth-type">Authentication Type</FormLabel>
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
          <h5 className="text-sm font-medium">Basic Authentication</h5>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="sourceConfig.authentication.credentials.username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="auth-username">Username</FormLabel>
                  <FormControl>
                    <Input
                      className="border-border"
                      id="auth-username"
                      placeholder="Username"
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
                  <FormLabel htmlFor="auth-password">Password</FormLabel>
                  <FormControl>
                    <Input
                      className="border-border"
                      id="auth-password"
                      type="password"
                      placeholder="Password"
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
          <h5 className="text-sm font-medium">API Key Authentication</h5>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="sourceConfig.authentication.credentials.headerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="header-name">Header Name</FormLabel>
                  <FormControl>
                    <Input
                      className="border-border"
                      id="header-name"
                      placeholder="X-API-Key"
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
                  <FormLabel htmlFor="header-value">Header Value</FormLabel>
                  <FormControl>
                    <Input
                      className="border-border"
                      id="header-value"
                      type="password"
                      placeholder="API Key Value"
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