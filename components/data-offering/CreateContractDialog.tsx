"use client";

import { DateTimePicker } from "@/components/DateTimePicker";
import { ActionDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  useCreateContract,
  useGetResourceListByDataspaceAndPublisher,
  useGetUserDIDList,
  useListPolicies,
} from "@/lib/gen";
import { useAppStore } from "@/lib/stores/app-store";
import { generateContractAddress } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createContractSchema = z.object({
  name: z.string().min(1, "Contract name is required"),
  consumer: z.string().min(1, "Consumer is required"),
  expires_at: z.string().min(1, "Expiration date is required"),
  max_access_count: z.number().min(1, "Max access count must be at least 1"),
  resource_id: z.string().min(1, "Resource is required"),
  policy: z.array(z.string()).min(1, "At least one policy must be selected"),
});

type CreateContractFormData = z.infer<typeof createContractSchema>;

interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateContractDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateContractDialogProps) {
  const { userDID, currentDataSpaceId } = useAppStore();
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);

  // API hooks
  const createContractMutation = useCreateContract();

  // Get users for consumer dropdown (exclude current user)
  const { data: usersData } = useGetUserDIDList(
    {},
    {
      query: { enabled: !!open },
    }
  );

  // Get resources for resource dropdown (only APPROVED status)
  const { data: resourcesData } = useGetResourceListByDataspaceAndPublisher(
    {
      dataspace: currentDataSpaceId || undefined,
      publisher: userDID || "",
      page: 1,
      page_size: 100, // Get more items for dropdown
    },
    {
      query: { enabled: !!currentDataSpaceId && !!open },
    }
  );

  // Get policies for policy selection
  const { data: policiesData } = useListPolicies(
    {
      page: 1,
      page_size: 100,
    },
    {
      query: { enabled: !!open },
    }
  );

  const form = useForm<CreateContractFormData>({
    resolver: zodResolver(createContractSchema),
    defaultValues: {
      name: "",
      consumer: "",
      expires_at: "",
      max_access_count: 100,
      resource_id: "",
      policy: [],
    },
  });

  const provider = process.env.NEXT_PUBLIC_USER_DID || "";

  // Filter users to exclude current user (usersData is a string array)
  const availableConsumers =
    usersData?.filter((userDID_item) => userDID_item !== userDID) || [];

  // Filter resources to only show APPROVED boundStatus
  const approvedResources =
    resourcesData?.data?.filter(
      (resource: any) => resource.boundStatus === "APPROVED"
    ) || [];

  const availablePolicies = (policiesData as any)?.policies || [];

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedPolicies([]);
    }
  }, [open, form]);

  // Handle policy selection
  const handlePolicyToggle = (policyId: string, checked: boolean) => {
    let newSelectedPolicies: string[];

    if (checked) {
      newSelectedPolicies = [...selectedPolicies, policyId];
    } else {
      newSelectedPolicies = selectedPolicies.filter((id) => id !== policyId);
    }

    setSelectedPolicies(newSelectedPolicies);
    form.setValue("policy", newSelectedPolicies);
  };

  const onSubmit = async (data: CreateContractFormData) => {
    try {
      if (!provider) {
        toast.error("Provider DID not configured");
        return;
      }

      // Generate contract address
      const address = generateContractAddress();

      // Format expires_at to ISO string
      const formattedExpiresAt = new Date(data.expires_at).toISOString();

      // Find selected policies and create policy array
      const selectedPolicyObjects = availablePolicies.filter((policy: any) =>
        data.policy.includes(policy.id)
      );

      const contractData = {
        address,
        consumer: data.consumer,
        expires_at: formattedExpiresAt,
        max_access_count: data.max_access_count,
        name: data.name,
        policy: selectedPolicyObjects,
        provider,
        resource_id: data.resource_id,
      };

      await createContractMutation.mutateAsync({ data: contractData });

      toast.success("Contract created successfully");
      onSuccess?.();
      onOpenChange(false);
      form.reset();
      setSelectedPolicies([]);
    } catch (error) {
      console.error("Error creating contract:", error);
      toast.error("Failed to create contract");
    }
  };

  return (
    <ActionDialog
      trigger={
        <Button size="sm" variant="secondary">
          <Plus className="h-4 w-4" />
          Add Contract
        </Button>
      }
      title="Create Contract"
      description="Create a new data sharing contract with specified policies"
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="lg"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Data Sharing Contract"
                    className="border-border"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Provider
              </label>
              <Input
                value={provider}
                readOnly
                className="border-border bg-muted/50 text-muted-foreground"
              />
            </div>
            <FormField
              control={form.control}
              name="consumer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consumer</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="border-border">
                        <SelectValue placeholder="Select consumer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableConsumers.map((userDIDItem) => (
                        <SelectItem key={userDIDItem} value={userDIDItem}>
                          {userDIDItem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration DateTime</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select expiration date and time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_access_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Access Count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="100"
                      className="border-border"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="resource_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="border-border">
                      <SelectValue placeholder="Select resource" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {approvedResources.map((resource: any) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{resource.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="policy"
            render={() => (
              <FormItem>
                <FormLabel>Policies</FormLabel>
                <div className="rounded-md">
                  <ScrollArea className="h-48 p-2">
                    <div className="space-y-3">
                      {availablePolicies.map((policy: any) => (
                        <div
                          key={policy.id}
                          className="bg-muted/30 flex items-start space-x-3 rounded-lg border p-2"
                        >
                          <div className="flex-1 space-y-1">
                            <label
                              htmlFor={policy.id}
                              className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {policy.name}
                            </label>
                            {policy.description && (
                              <p className="text-muted-foreground text-xs">
                                {policy.description}
                              </p>
                            )}
                            {/* <div className="flex items-center space-x-2 text-xs">
                              <span className="text-muted-foreground">
                                Security Level:
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                                  policy.security_level === "high"
                                    ? "bg-red-100 text-red-800"
                                    : policy.security_level === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {policy.security_level}
                              </span>
                            </div> */}
                          </div>
                          <Checkbox
                            id={policy.id}
                            className="border-border"
                            checked={selectedPolicies.includes(policy.id)}
                            onCheckedChange={(checked) =>
                              handlePolicyToggle(policy.id, checked as boolean)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createContractMutation.isPending}>
              {createContractMutation.isPending ? (
                <>
                  <Spinner variant="circle" />
                  Creating...
                </>
              ) : (
                "Create Contract"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ActionDialog>
  );
}
