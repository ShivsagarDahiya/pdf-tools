import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HistoryEntry, UserProfile, UserRole } from "../backend.d";
import { useActor } from "./useActor";

export function useToolUsage() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, bigint]>>({
    queryKey: ["toolUsage"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getToolUsage();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<HistoryEntry[]>({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIncrementToolUsage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (toolName: string) => {
      if (!actor) return;
      await actor.incrementToolUsage(toolName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["toolUsage"] });
    },
  });
}

export function useAddHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      toolName,
      originalFile,
      resultFile,
    }: {
      toolName: string;
      originalFile: string;
      resultFile: string;
    }) => {
      if (!actor) return;
      await actor.addHistoryEntry(toolName, originalFile, resultFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

export function useGetProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) return;
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useAllUserHistories() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allUserHistories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserHistories();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetUserProfile(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      try {
        return await actor.getUserProfile(principal);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 60_000,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      role,
    }: {
      principal: Principal;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.assignCallerUserRole(principal, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUserHistories"] });
    },
  });
}
