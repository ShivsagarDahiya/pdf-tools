import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type PlatformRole = "free" | "creator" | "plus" | "admin";

interface PlatformRoleContextValue {
  platformRole: PlatformRole;
  setPlatformRole: (role: PlatformRole) => void;
  isCreator: boolean;
  isPlus: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  refreshRole: () => void;
}

const PlatformRoleContext = createContext<PlatformRoleContextValue>({
  platformRole: "free",
  setPlatformRole: () => {},
  isCreator: false,
  isPlus: false,
  isAdmin: false,
  isLoading: false,
  refreshRole: () => {},
});

export function PlatformRoleProvider({
  children,
}: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [platformRole, setPlatformRoleState] = useState<PlatformRole>(() => {
    return (localStorage.getItem("platformRole") as PlatformRole) || "free";
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchRole = useCallback(async () => {
    if (!actor || isFetching || !identity) return;
    setIsLoading(true);
    try {
      if (typeof (actor as any).getPlatformRole === "function") {
        const role = (await (actor as any).getPlatformRole()) as string;
        const normalized = (role || "free") as PlatformRole;
        setPlatformRoleState(normalized);
        localStorage.setItem("platformRole", normalized);
      }
    } catch {
      // fallback to stored value
    } finally {
      setIsLoading(false);
    }
  }, [actor, isFetching, identity]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  // Clear on logout
  useEffect(() => {
    if (!identity) {
      setPlatformRoleState("free");
      localStorage.removeItem("platformRole");
    }
  }, [identity]);

  const setPlatformRole = useCallback((role: PlatformRole) => {
    setPlatformRoleState(role);
    localStorage.setItem("platformRole", role);
  }, []);

  const value = useMemo(
    () => ({
      platformRole,
      setPlatformRole,
      isCreator: platformRole === "creator" || platformRole === "admin",
      isPlus: platformRole === "plus" || platformRole === "admin",
      isAdmin: platformRole === "admin",
      isLoading,
      refreshRole: fetchRole,
    }),
    [platformRole, setPlatformRole, isLoading, fetchRole],
  );

  return (
    <PlatformRoleContext.Provider value={value}>
      {children}
    </PlatformRoleContext.Provider>
  );
}

export function usePlatformRole() {
  return useContext(PlatformRoleContext);
}
