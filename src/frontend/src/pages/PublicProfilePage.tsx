import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useActor } from "@/hooks/useActor";
import { Principal } from "@icp-sdk/core/principal";
import { useParams } from "@tanstack/react-router";
import { FileText, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { UserProfile } from "../backend.d";

export function PublicProfilePage() {
  const { principalId } = useParams({ from: "/user/$principalId" });
  const { actor } = useActor();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actor || !principalId) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const principal = Principal.fromText(principalId);
        const result = await actor.getUserProfile(principal);
        if (!cancelled) {
          setProfile(result);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Profile is private or not found.");
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [actor, principalId]);

  const displayName = profile?.displayName || "Anonymous User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="container max-w-lg py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-ui">
              Loading profile…
            </p>
          </div>
        ) : error ? (
          <Card className="border-border shadow-card text-center">
            <CardContent className="pt-12 pb-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="font-display font-bold text-xl text-foreground mb-2">
                Profile Not Available
              </h2>
              <p className="text-sm text-muted-foreground font-ui mb-4">
                {error}
              </p>
              <p className="text-xs text-muted-foreground font-mono bg-muted/50 rounded-lg px-4 py-2 break-all">
                {principalId}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border shadow-card overflow-hidden">
            {/* Header gradient */}
            <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
            </div>

            <CardContent className="relative pt-0 pb-8 text-center px-8">
              {/* Avatar */}
              <div className="-mt-10 mb-4 flex justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-background bg-primary/10 flex items-center justify-center overflow-hidden shadow-lg">
                  {profile?.profilePicUrl ? (
                    <img
                      src={profile.profilePicUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-2xl font-display font-bold text-primary">
                      {initials}
                    </span>
                  )}
                </div>
              </div>

              {/* Name */}
              <h1 className="font-display font-bold text-2xl text-foreground mb-1">
                {displayName}
              </h1>

              {/* Tagline */}
              <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground font-ui mb-4">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Using PDF Tools
              </div>

              {/* Principal ID */}
              <div className="bg-muted/50 rounded-xl px-4 py-3 mb-6">
                <p className="text-xs text-muted-foreground font-ui mb-1">
                  Principal ID
                </p>
                <p className="text-xs font-mono text-foreground break-all leading-relaxed">
                  {principalId}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="font-ui gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(principalId || "");
                }}
              >
                Copy Principal ID
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </main>
  );
}
