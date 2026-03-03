import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetProfile, useUpdateProfile } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Check, Loader2, LogIn, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function ProfilePage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString();

  const queryClient = useQueryClient();
  const { data: profile, isLoading: isProfileLoading } = useGetProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

  const [displayName, setDisplayName] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state from backend profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setProfilePicUrl(profile.profilePicUrl || "");
      setPreviewUrl(profile.profilePicUrl || "");
    }
  }, [profile]);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreviewUrl(dataUrl);
        setProfilePicUrl(dataUrl);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [],
  );

  const handleSave = useCallback(() => {
    setSaved(false);
    updateProfile(
      { displayName, profilePicUrl },
      {
        onSuccess: () => {
          setSaved(true);
          toast.success("Profile saved successfully!");
          queryClient.invalidateQueries({ queryKey: ["userProfile"] });
          setTimeout(() => setSaved(false), 3000);
        },
        onError: () => {
          toast.error("Failed to save profile. Please try again.");
        },
      },
    );
  }, [displayName, profilePicUrl, updateProfile, queryClient]);

  // Derive initials from display name or principal
  const initials = displayName
    ? displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : principalStr
      ? principalStr.slice(0, 2).toUpperCase()
      : "??";

  // Not logged in state
  if (!identity) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Sign in to manage your profile
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Log in with Internet Identity to set a display name, upload a
            profile picture, and personalize your experience.
          </p>
          <Button
            size="lg"
            onClick={login}
            disabled={isLoggingIn}
            className="font-ui font-semibold gap-2"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {isLoggingIn ? "Signing in…" : "Login"}
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-2xl py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-4 mb-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">
              Your Profile
            </h1>
            <p className="text-muted-foreground">
              Customize your display name and profile picture.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Avatar card */}
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-ui font-semibold">
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isProfileLoading ? (
                <div className="flex items-center gap-6">
                  <Skeleton className="w-24 h-24 rounded-full" />
                  <Skeleton className="h-9 w-36" />
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="relative w-24 h-24 rounded-full overflow-hidden group cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-label="Change profile picture"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary font-display">
                          {initials}
                        </span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Upload profile picture"
                  />

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAvatarClick}
                      className="font-ui gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, GIF, WebP up to 5MB
                    </p>
                    {previewUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPreviewUrl("");
                          setProfilePicUrl("");
                        }}
                        className="font-ui text-muted-foreground hover:text-destructive text-xs h-7 px-2"
                      >
                        Remove photo
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Display name card */}
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-ui font-semibold">
                Display Name
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isProfileLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="display-name" className="font-ui text-sm">
                      Name
                    </Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      maxLength={50}
                      className="font-ui"
                      autoComplete="name"
                    />
                    <p className="text-xs text-muted-foreground">
                      {displayName.length}/50 characters
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Principal / Account info */}
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-ui font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label className="font-ui text-sm text-muted-foreground">
                  Principal ID
                </Label>
                <div className="px-3 py-2 bg-muted/40 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {principalStr}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is your unique, read-only identifier on the Internet
                  Computer.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              onClick={handleSave}
              disabled={isSaving || isProfileLoading}
              className="font-ui font-semibold gap-2 min-w-[140px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
