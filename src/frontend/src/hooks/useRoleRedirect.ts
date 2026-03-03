import { usePlatformRole } from "@/contexts/PlatformRoleContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

/**
 * Watches for a fresh login event and redirects the user to their
 * role-specific dashboard. Runs only once per login session.
 *
 * Role → Dashboard mapping:
 *   admin    → /admin
 *   creator  → /creator-dashboard
 *   plus     → /dashboard          (premium Normal User)
 *   free     → /dashboard          (Normal User)
 *
 * Business owners use the "plus" or "free" role in the platform role
 * system; they are identified by visiting /sponsor-dashboard manually.
 * If a sponsor-specific role is added in future, map it here.
 */
export function useRoleRedirect() {
  const { isLoginSuccess, identity } = useInternetIdentity();
  const { platformRole, isLoading } = usePlatformRole();
  const navigate = useNavigate();

  // Track whether we already redirected for this login session
  const hasRedirected = useRef(false);

  // Reset the flag whenever the user logs out (identity becomes undefined)
  useEffect(() => {
    if (!identity) {
      hasRedirected.current = false;
    }
  }, [identity]);

  useEffect(() => {
    // Only redirect immediately after a fresh login
    if (!isLoginSuccess) return;
    // Wait for role to finish loading
    if (isLoading) return;
    // Only redirect once per login
    if (hasRedirected.current) return;

    hasRedirected.current = true;

    switch (platformRole) {
      case "admin":
        void navigate({ to: "/admin" });
        break;
      case "creator":
        void navigate({ to: "/creator-dashboard" });
        break;
      case "plus":
        void navigate({ to: "/dashboard" });
        break;
      default:
        // free users and business owners (role not yet differentiated) go to /dashboard
        void navigate({ to: "/dashboard" });
        break;
    }
  }, [isLoginSuccess, platformRole, isLoading, navigate]);
}
