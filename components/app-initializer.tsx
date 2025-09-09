'use client'

import { useAppStore } from "@/lib/stores/app-store";
import { useEffect } from "react";

export function AppInitializer() {
  const { setUserDID, setConnectorDID, isInitialized, setInitialized } =
    useAppStore();

  useEffect(() => {
    if (isInitialized) return;

    const userDID = process.env.NEXT_PUBLIC_USER_DID;
    const connectorDID = process.env.NEXT_PUBLIC_CONNECTOR_DID;

    if (userDID) {
      setUserDID(userDID);
    } else {
      console.warn("NEXT_PUBLIC_USER_DID environment variable not set");
    }

    if (connectorDID) {
      setConnectorDID(connectorDID);
    } else {
      console.warn("NEXT_PUBLIC_CONNECTOR_DID environment variable not set");
    }

    setInitialized(true);
  }, [setUserDID, setConnectorDID, isInitialized, setInitialized]);

  return null
}