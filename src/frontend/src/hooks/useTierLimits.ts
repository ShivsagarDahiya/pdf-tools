export interface TierLimits {
  isPlus: boolean;
  isFree: boolean;
  maxFileSizeMB: number;
  canUseBatchMore: boolean;
  dailyOpsLeft: number;
}

export function useTierLimits(): TierLimits {
  const platformRole = (localStorage.getItem("platformRole") ||
    "free") as string;
  const isPlus = platformRole === "plus" || platformRole === "admin";
  const isFree = !isPlus;

  // Daily usage
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem("dailyUsageDate");
  let dailyUsage = 0;
  if (savedDate === today) {
    dailyUsage = Number.parseInt(localStorage.getItem("dailyUsage") || "0");
  }

  const maxFileSizeMB = isPlus ? 200 : 5;
  const dailyLimit = isPlus ? Number.POSITIVE_INFINITY : 10;
  const dailyOpsLeft = isPlus ? 999 : Math.max(0, dailyLimit - dailyUsage);

  return {
    isPlus,
    isFree,
    maxFileSizeMB,
    canUseBatchMore: isPlus || dailyOpsLeft > 0,
    dailyOpsLeft,
  };
}
