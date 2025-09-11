import type { DataSourceType } from "@/types";
import { z } from "zod";

// Base field validation - now aligned with API requirements
export const baseOfferingSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description cannot exceed 500 characters"),
  dataType: z.enum(["local_file", "s3", "nas", "restful"] as const),
  status: z.enum(["Active", "Inactive"] as const),
});

// Local file configuration validation
export const localFileConfigSchema = z.object({
  filePath: z.string().min(1, "File path is required"),
  format: z.enum(["CSV", "JSON", "XML", "Parquet"] as const),
});

// S3 configuration validation - simplified per requirements
export const s3ConfigSchema = z.object({
  bucketName: z.string().min(1, "Bucket name is required"),
  objectName: z.string().min(1, "Object name is required"),
  region: z.string().min(1, "Region is required"),
  fileFormat: z.enum(["CSV", "JSON", "XML", "Parquet"] as const),
});

// NAS configuration validation
export const nasConfigSchema = z.object({
  serverAddress: z.string().min(1, "Server address is required").ip("Please enter a valid IP address"),
  sharePath: z.string().min(1, "Share path is required"),
  protocol: z.enum(["nfs", "smb", "ftp"] as const),
  credentials: z.object({
    username: z.string().optional(),
    password: z.string().optional(),
  }).optional(),
});

// RESTful configuration validation
export const restfulConfigSchema = z.object({
  apiEndpoint: z.string().url("Please enter a valid API endpoint URL"),
  method: z.enum(["GET", "POST"] as const),
  authentication: z.object({
    type: z.enum(["none", "basic", "api_key"] as const),
    credentials: z.object({
      username: z.string().optional(),
      password: z.string().optional(),
      headerName: z.string().optional(),
      headerValue: z.string().optional(),
    }).optional(),
  }).optional(),
});

// Union validation - Dynamically validate sourceConfig based on dataType
export const createDataOfferingSchema = baseOfferingSchema.and(
  z.discriminatedUnion("dataType", [
    z.object({
      dataType: z.literal("local_file"),
      sourceConfig: localFileConfigSchema,
    }),
    z.object({
      dataType: z.literal("s3"),
      sourceConfig: s3ConfigSchema,
    }),
    z.object({
      dataType: z.literal("nas"),
      sourceConfig: nasConfigSchema,
    }),
    z.object({
      dataType: z.literal("restful"),
      sourceConfig: restfulConfigSchema,
    }),
  ])
);

// Export types
export type CreateDataOfferingFormData = z.infer<typeof createDataOfferingSchema>;

// Default value generation function
export const getDefaultValues = (dataType: DataSourceType): CreateDataOfferingFormData => {
  const base = {
    title: "",
    description: "",
    dataType,
    status: "Active" as const,
  };

  switch (dataType) {
    case "local_file":
      return {
        ...base,
        dataType: "local_file",
        sourceConfig: {
          filePath: "",
          format: "CSV" as const,
        },
      };
    case "s3":
      return {
        ...base,
        dataType: "s3",
        sourceConfig: {
          bucketName: "",
          objectName: "",
          region: "laos-center",
          fileFormat: "CSV" as const,
        },
      };
    case "nas":
      return {
        ...base,
        dataType: "nas",
        sourceConfig: {
          serverAddress: "",
          sharePath: "",
          protocol: "nfs" as const,
        },
      };
    case "restful":
      return {
        ...base,
        dataType: "restful",
        sourceConfig: {
          apiEndpoint: "",
          method: "GET" as const,
          authentication: {
            type: "none" as const,
          },
        },
      };
    default:
      return {
        ...base,
        dataType: "s3", // Default to S3 as requested
        sourceConfig: {
          bucketName: "",
          objectName: "",
          region: "laos-center",
          fileFormat: "CSV" as const,
        },
      };
  }
};