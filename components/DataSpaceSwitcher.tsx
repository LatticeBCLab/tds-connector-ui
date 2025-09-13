"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { useDataSpace } from "@/lib/contexts/DataSpaceContext";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, ChevronsUpDown, Globe } from "lucide-react";
import { useState } from "react";

export function DataSpaceSwitcher() {
  const [open, setOpen] = useState(false);
  const {
    currentDataSpace,
    availableDataSpaces,
    switchDataSpace,
    isLoading,
    error,
  } = useDataSpace();

  const handleDataSpaceSwitch = (dataSpaceId: string) => {
    switchDataSpace(dataSpaceId);
    setOpen(false);
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-[240px] justify-between">
        <div className="flex items-center space-x-2">
          <Spinner className="h-4 w-4" />
          <span>Loading...</span>
        </div>
      </Button>
    );
  }

  if (error) {
    return (
      <Button
        variant="outline"
        disabled
        className="text-destructive w-[240px] justify-between"
      >
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>Loading failed</span>
        </div>
      </Button>
    );
  }

  if (!currentDataSpace || availableDataSpaces.length === 0) {
    return (
      <Button
        variant="outline"
        disabled
        className="text-muted-foreground w-[240px] justify-between"
      >
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span>No data space</span>
        </div>
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span className="truncate">{currentDataSpace.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Command>
          <CommandInput placeholder="Search data space..." />
          <CommandList>
            <CommandEmpty>No data space found.</CommandEmpty>
            <CommandGroup>
              {availableDataSpaces.map((dataSpace) => (
                <CommandItem
                  className="cursor-pointer"
                  key={dataSpace.id}
                  value={dataSpace.id}
                  onSelect={() => handleDataSpaceSwitch(dataSpace.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentDataSpace.id === dataSpace.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex-1">
                    <span className="font-medium">{dataSpace.name}</span>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {dataSpace.description}
                    </p>
                  </div>
                  <DataSpaceStatus status={dataSpace.status} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DataSpaceStatus({ status }: { status: string }) {
  switch (status) {
    case "active":
      return (
        <div className="relative">
          <div className="size-2 rounded-full bg-green-500"></div>
          <div className="absolute inset-0 size-2 animate-ping rounded-full bg-green-500 opacity-75"></div>
        </div>
      );
    case "pending":
      return <div className="size-2 rounded-full bg-yellow-500"></div>;
    case "inactive":
      return <div className="size-2 rounded-full bg-gray-400"></div>;
    case "archived":
      return <div className="size-2 rounded-full bg-red-500"></div>;
    default:
      return <div className="size-2 rounded-full bg-gray-400"></div>;
  }
}