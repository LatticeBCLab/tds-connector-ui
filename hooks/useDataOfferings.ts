import { useDataSpace } from "@/lib/contexts/DataSpaceContext";
import { getDataForSpace } from "@/lib/services/DataSpaceDataService";
import {
  DataContract,
  DataOffering,
  DataRequest,
  DataSourceType,
  ExternalDataOffering,
  PolicyTemplate
} from "@/types";
import { useEffect, useState } from "react";

export interface UseDataOfferingsReturn {
  // Data offerings
  dataOfferings: DataOffering[];
  setDataOfferings: (offerings: DataOffering[]) => void;

  // Policy templates
  policyTemplates: PolicyTemplate[];
  setPolicyTemplates: (templates: PolicyTemplate[]) => void;

  // Data contracts
  dataContracts: DataContract[];
  setDataContracts: (contracts: DataContract[]) => void;

  // External offerings
  externalOfferings: ExternalDataOffering[];
  setExternalOfferings: (offerings: ExternalDataOffering[]) => void;

  // Data requests
  dataRequests: DataRequest[];
  setDataRequests: (requests: DataRequest[]) => void;

  // Dialog states
  isAddOfferingOpen: boolean;
  setIsAddOfferingOpen: (open: boolean) => void;
  isAddContractOpen: boolean;
  setIsAddContractOpen: (open: boolean) => void;
  isRequestDataOpen: boolean;
  setIsRequestDataOpen: (open: boolean) => void;

  // Selected items
  selectedOffering: ExternalDataOffering | null;
  setSelectedOffering: (offering: ExternalDataOffering | null) => void;

  // Form states
  newOffering: {
    title: string;
    description: string;
    dataType: DataSourceType | "";
    accessPolicy: string;
    sourceConfig?: any;
  };
  setNewOffering: (offering: any) => void;

  newContract: {
    name: string;
    contractAddress: string;
    providerDID: string;
    consumerDID: string;
    policy: string;
    maxAccessCount?: number;
    expiresAt?: string;
  };
  setNewContract: (contract: any) => void;

  newRequest: {
    accessMode: "api" | "download";
    purpose: string;
  };
  setNewRequest: (request: any) => void;

  // Search & filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;

  // Actions
  createOffering: () => Promise<void>;
  createContract: () => Promise<void>;
  requestData: () => Promise<void>;

  // Computed values
  filteredOfferings: ExternalDataOffering[];
}

export function useDataOfferings(): UseDataOfferingsReturn {
  const { currentDataSpace } = useDataSpace();
  const [dataOfferings, setDataOfferings] = useState<DataOffering[]>([]);

  // 当数据空间切换时，更新数据
  useEffect(() => {
    const spaceData = getDataForSpace('healthcare');
    setDataOfferings(spaceData.dataOfferings);
    setPolicyTemplates(spaceData.policyTemplates);
    setDataContracts(spaceData.dataContracts);
    setExternalOfferings(spaceData.externalOfferings);
    setDataRequests(spaceData.dataRequests);
  }, [currentDataSpace?.id]);

  const [policyTemplates, setPolicyTemplates] = useState<PolicyTemplate[]>([]);

  const [dataContracts, setDataContracts] = useState<DataContract[]>([]);

  const [externalOfferings, setExternalOfferings] = useState<
    ExternalDataOffering[]
  >([]);

  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);

  // Dialog states
  const [isAddOfferingOpen, setIsAddOfferingOpen] = useState(false);
  const [isAddContractOpen, setIsAddContractOpen] = useState(false);
  const [isRequestDataOpen, setIsRequestDataOpen] = useState(false);

  // Selected items
  const [selectedOffering, setSelectedOffering] =
    useState<ExternalDataOffering | null>(null);

  // Form states
  const [newOffering, setNewOffering] = useState({
    title: "",
    description: "",
    dataType: "" as DataSourceType | "",
    accessPolicy: "",
    sourceConfig: undefined,
  });

  const [newContract, setNewContract] = useState({
    name: "",
    contractAddress: "",
    providerDID: "",
    consumerDID: "",
    policy: "",
    maxAccessCount: undefined,
    expiresAt: "",
  });

  const [newRequest, setNewRequest] = useState({
    accessMode: "api" as "api" | "download",
    purpose: "",
  });

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Computed values
  const filteredOfferings = externalOfferings.filter((offering) => {
    const matchesSearch =
      offering.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offering.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offering.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      offering.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Actions
  const createOffering = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newDataOffering: DataOffering = {
      id: Date.now().toString(),
      title: newOffering.title,
      description: newOffering.description,
      dataType: newOffering.dataType as DataSourceType,
      accessPolicy: newOffering.accessPolicy,
      status: "active",
      registrationStatus: "unregistered",
      createdAt: new Date().toISOString(),
      sourceConfig: newOffering.sourceConfig,
      // Add missing required fields
      hostingStatus: "self_managed",
      crossBorderAuditStatus: "not_required",
      dataZoneCode: "DEFAULT",
      storageLocation: "local",
      traceabilityInfo: {
        dataSource: newOffering.title,
        blockchainMainChainId: "chain-001",
        ownerDID: "did:example:owner123",
        traceabilityHash: "hash-" + Date.now().toString(),
      },
    };
    setDataOfferings((prev) => [...prev, newDataOffering]);
    setNewOffering({
      title: "",
      description: "",
      dataType: "",
      accessPolicy: "",
      sourceConfig: undefined,
    });
    setIsAddOfferingOpen(false);
  };

  const createContract = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newDataContract: DataContract = {
      id: Date.now().toString(),
      name: newContract.name,
      contractAddress: newContract.contractAddress,
      providerDID: newContract.providerDID,
      consumerDID: newContract.consumerDID,
      policy: newContract.policy,
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: newContract.expiresAt,
      accessCount: 0,
      dataVolume: "0 MB",
      maxAccessCount: newContract.maxAccessCount,
      violationCount: 0,
      isViolated: false,
      isExpired: false,
    };
    setDataContracts((prev) => [...prev, newDataContract]);
    setNewContract({
      name: "",
      contractAddress: "",
      providerDID: "",
      consumerDID: "",
      policy: "",
      maxAccessCount: undefined,
      expiresAt: "",
    });
    setIsAddContractOpen(false);
  };

  const requestData = async () => {
    if (!selectedOffering) return;

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newDataRequest: DataRequest = {
      id: Date.now().toString(),
      offeringId: selectedOffering.id,
      offeringTitle: selectedOffering.title,
      provider: selectedOffering.provider,
      requestedAt: new Date().toISOString(),
      status: "pending",
      accessMode: newRequest.accessMode,
      purpose: newRequest.purpose,
    };
    setDataRequests((prev) => [...prev, newDataRequest]);
    setNewRequest({ accessMode: "api", purpose: "" });
    setIsRequestDataOpen(false);
    setSelectedOffering(null);
  };

  return {
    dataOfferings,
    setDataOfferings,
    policyTemplates,
    setPolicyTemplates,
    dataContracts,
    setDataContracts,
    externalOfferings,
    setExternalOfferings,
    dataRequests,
    setDataRequests,
    isAddOfferingOpen,
    setIsAddOfferingOpen,
    isAddContractOpen,
    setIsAddContractOpen,
    isRequestDataOpen,
    setIsRequestDataOpen,
    selectedOffering,
    setSelectedOffering,
    newOffering,
    setNewOffering,
    newContract,
    setNewContract,
    newRequest,
    setNewRequest,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    createOffering,
    createContract,
    requestData,
    filteredOfferings,
  };
}
