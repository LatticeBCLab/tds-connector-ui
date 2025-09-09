import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  userDID: string | null
  connectorDID: string | null
  currentDataSpaceId: string | null
  setUserDID: (did: string) => void
  setConnectorDID: (did: string) => void
  setCurrentDataSpaceId: (id: string) => void
  clearUserSession: () => void
  isInitialized: boolean
  setInitialized: (initialized: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userDID: null,
      connectorDID: null,
      currentDataSpaceId: null,
      isInitialized: false,
      setUserDID: (did) => set({ userDID: did }),
      setConnectorDID: (did) => set({ connectorDID: did }),
      setCurrentDataSpaceId: (id) => set({ currentDataSpaceId: id }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      clearUserSession: () => set({ 
        userDID: null, 
        connectorDID: null,
        currentDataSpaceId: null, 
        isInitialized: false 
      }),
    }),
    {
      name: 'tds-app-storage',
      partialize: (state) => ({
        userDID: state.userDID,
        connectorDID: state.connectorDID,
        currentDataSpaceId: state.currentDataSpaceId,
      }),
    }
  )
)