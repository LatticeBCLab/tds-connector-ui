"use client";

import { useGetAllDataSpaces } from "@/lib/gen/hooks/useGetAllDataSpaces";
import { useGetI18nByRowIDFieldAndLang } from "@/lib/gen/hooks/useGetI18nByRowIDFieldAndLang";
import type { ModelsDataSpace } from "@/lib/gen/types/models/DataSpace";
import { useLocale } from "next-intl";
import {
  createContext,
  ReactNode,
  useCallback,
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

// Hook to get translated data space
function useTranslatedDataSpace(dataSpace: DataSpace | null, lang: string): DataSpace | null {
  const { data: translatedName } = useGetI18nByRowIDFieldAndLang(
    {
      row_id: dataSpace?.id || "",
      field: "name",
      lang_code: lang
    },
    {
      query: {
        enabled: !!dataSpace?.id && !!lang,
        staleTime: 5 * 60 * 1000, // 5分钟缓存
      }
    }
  );

  const { data: translatedDescription } = useGetI18nByRowIDFieldAndLang(
    {
      row_id: dataSpace?.id || "",
      field: "description",
      lang_code: lang
    },
    {
      query: {
        enabled: !!dataSpace?.id && !!lang,
        staleTime: 5 * 60 * 1000, // 5分钟缓存
      }
    }
  );

  return useMemo(() => {
    if (!dataSpace) return null;
    return {
      ...dataSpace,
      name: translatedName?.value || dataSpace.name,
      description: translatedDescription?.value || dataSpace.description,
    };
  }, [dataSpace, translatedName?.value, translatedDescription?.value]);
}

// Component to handle individual data space translation
function TranslatedDataSpaceItem({ dataSpace, lang, onTranslated }: {
  dataSpace: DataSpace;
  lang: string;
  onTranslated: (translatedDataSpace: DataSpace) => void;
}) {
  const { data: translatedName } = useGetI18nByRowIDFieldAndLang(
    {
      row_id: dataSpace.id,
      field: "name",
      lang_code: lang
    },
    {
      query: {
        enabled: !!dataSpace.id && !!lang,
        staleTime: 5 * 60 * 1000,
      }
    }
  );

  const { data: translatedDescription } = useGetI18nByRowIDFieldAndLang(
    {
      row_id: dataSpace.id,
      field: "description",
      lang_code: lang
    },
    {
      query: {
        enabled: !!dataSpace.id && !!lang,
        staleTime: 5 * 60 * 1000,
      }
    }
  );

  const translatedDataSpace = useMemo(() => ({
    ...dataSpace,
    name: translatedName?.value || dataSpace.name,
    description: translatedDescription?.value || dataSpace.description,
  }), [dataSpace, translatedName?.value, translatedDescription?.value]);

  useEffect(() => {
    onTranslated(translatedDataSpace);
  }, [translatedDataSpace, onTranslated]);

  return null;
}

export function DataSpaceProvider({ children }: { children: ReactNode }) {
  const lang = useLocale();
  const [currentDataSpace, setCurrentDataSpace] = useState<DataSpace | null>(
    null
  );
  const [translatedDataSpaces, setTranslatedDataSpaces] = useState<Map<string, DataSpace>>(new Map());
  const { data: apiDataSpaces, isLoading, error } = useGetAllDataSpaces({}, {
    query: {
      staleTime: 5 * 60 * 1000, // 5分钟缓存
    }
  });

  const baseAvailableDataSpaces = useMemo(
    () => (apiDataSpaces ? apiDataSpaces.map(mapApiDataSpaceToLocal) : []),
    [apiDataSpaces]
  );

  // Get translated current data space
  const translatedCurrentDataSpace = useTranslatedDataSpace(currentDataSpace, lang);
  
  // Handle translated data space updates
  const handleTranslatedDataSpace = useCallback((translatedDataSpace: DataSpace) => {
    setTranslatedDataSpaces(prev => new Map(prev.set(translatedDataSpace.id, translatedDataSpace)));
  }, []);

  // Get available data spaces with translations
  const availableDataSpaces = useMemo(() => {
    return baseAvailableDataSpaces.map(dataSpace => 
      translatedDataSpaces.get(dataSpace.id) || dataSpace
    );
  }, [baseAvailableDataSpaces, translatedDataSpaces]);

  useEffect(() => {
    if (availableDataSpaces.length > 0 && !currentDataSpace) {
      const activeDataSpace = availableDataSpaces.find(
        (ds) => ds.status === "active"
      );
      setCurrentDataSpace(activeDataSpace || availableDataSpaces[0]);
    }
  }, [availableDataSpaces, currentDataSpace]);

  const switchDataSpace = useCallback((dataSpaceId: string) => {
    const dataSpace = availableDataSpaces.find((ds) => ds.id === dataSpaceId);
    if (dataSpace) {
      setCurrentDataSpace(dataSpace);
    }
  }, [availableDataSpaces]);

  const contextValue = useMemo(() => ({
    currentDataSpace: translatedCurrentDataSpace,
    availableDataSpaces,
    switchDataSpace,
    isLoading,
    error: error?.message || null,
  }), [translatedCurrentDataSpace, availableDataSpaces, switchDataSpace, isLoading, error]);

  return (
    <DataSpaceContext.Provider value={contextValue}>
      {children}
      {/* Render translation components for each data space */}
      {baseAvailableDataSpaces.map(dataSpace => (
        <TranslatedDataSpaceItem
          key={dataSpace.id}
          dataSpace={dataSpace}
          lang={lang}
          onTranslated={handleTranslatedDataSpace}
        />
      ))}
    </DataSpaceContext.Provider>
  );
}

export function useDataSpace(): DataSpaceContextType {
  const context = useContext(DataSpaceContext);
  if (context === undefined) {
    throw new Error("useDataSpace must be used within a DataSpaceProvider");
  }
  return context;
}
