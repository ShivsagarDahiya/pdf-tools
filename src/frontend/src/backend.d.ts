import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface HistoryEntry {
    originalFile: string;
    timestamp: Time;
    resultFile: string;
    toolName: string;
}
export interface UserProfile {
    profilePicUrl: string;
    displayName: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addHistoryEntry(toolName: string, originalFile: string, resultFile: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllUserHistories(): Promise<Array<[Principal, Array<HistoryEntry>]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHistory(): Promise<Array<HistoryEntry>>;
    getToolUsage(): Promise<Array<[string, bigint]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    incrementToolUsage(toolName: string): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitTask(_tool: string, _input: string): Promise<bigint>;
    updateTaskStatus(_taskId: bigint, _output: string): Promise<void>;
}
