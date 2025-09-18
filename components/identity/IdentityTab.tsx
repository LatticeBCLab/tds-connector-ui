"use client";

import { useAppStore } from "@/lib/stores/app-store";
import { ConnectorIdentityCard } from "./ConnectorIdentityCard";
import { TerminalIdentityCard } from "./TerminalIdentityCard";
import { UserIdentityCard } from "./UserIdentityCard";

export function IdentityTab() {
  const { userDID, connectorDID } = useAppStore();

  return (
    <div className="space-y-6">
      {/* 两列布局 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 左侧：Connector Identity 和 Terminal Identity */}
        <div className="space-y-6">
          <ConnectorIdentityCard connectorDID={connectorDID} />
          <TerminalIdentityCard
            terminalDID={process.env.NEXT_PUBLIC_TERMINAL_DID || null}
          />
        </div>

        {/* 右侧：User Identity */}
        <div className="space-y-6">
          <UserIdentityCard userDID={userDID} />
        </div>
      </div>
    </div>
  );
}
