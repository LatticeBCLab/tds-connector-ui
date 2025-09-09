"use client";

import { useGetAllDataSpaces } from "@/lib/gen/hooks/useGetAllDataSpaces";
import type { ModelsDataSpace } from "@/lib/gen/types/models/DataSpace";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface DataSpace {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "pending" | "archived";
  country?: string;
}

interface DataSpaceContextType {
  currentDataSpace: DataSpace | null;
  availableDataSpaces: DataSpace[];
  switchDataSpace: (dataSpaceId: string) => void;
  isLoading: boolean;
  error: string | null;
}

const mapApiDataSpaceToLocal = (apiDataSpace: ModelsDataSpace): DataSpace => ({
  id: apiDataSpace.id || "",
  name: apiDataSpace.name || "",
  description: apiDataSpace.description || "",
  status: mapApiStatus(apiDataSpace.status),
  country: apiDataSpace.country,
});

const mapApiStatus = (
  status?: string
): "active" | "inactive" | "pending" | "archived" => {
  switch (status) {
    case "ACTIVE":
      return "active";
    case "INACTIVE":
      return "inactive";
    case "PENDING":
      return "pending";
    case "ARCHIVED":
      return "archived";
    default:
      return "inactive";
  }
};

const DataSpaceContext = createContext<DataSpaceContextType | undefined>(
  undefined
);

export function DataSpaceProvider({ children }: { children: ReactNode }) {
  const [currentDataSpace, setCurrentDataSpace] = useState<DataSpace | null>(
    null
  );
  const { data: apiDataSpaces, isLoading, error } = useGetAllDataSpaces();

  const availableDataSpaces = useMemo(
    () => (apiDataSpaces ? apiDataSpaces.map(mapApiDataSpaceToLocal) : []),
    [apiDataSpaces]
  );

  useEffect(() => {
    if (availableDataSpaces.length > 0 && !currentDataSpace) {
      const activeDataSpace = availableDataSpaces.find(
        (ds) => ds.status === "active"
      );
      setCurrentDataSpace(activeDataSpace || availableDataSpaces[0]);
    }
  }, [availableDataSpaces, currentDataSpace]);

  const switchDataSpace = (dataSpaceId: string) => {
    const dataSpace = availableDataSpaces.find((ds) => ds.id === dataSpaceId);
    if (dataSpace) {
      setCurrentDataSpace(dataSpace);
    }
  };

  return (
    <DataSpaceContext.Provider
      value={{
        currentDataSpace,
        availableDataSpaces,
        switchDataSpace,
        isLoading,
        error: error?.message || null,
      }}
    >
      {children}
    </DataSpaceContext.Provider>
  );
}

export function useDataSpace() {
  const context = useContext(DataSpaceContext);
  if (context === undefined) {
    throw new Error("useDataSpace must be used within a DataSpaceProvider");
  }
  return context;
}
