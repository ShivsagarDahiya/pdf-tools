import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ACCENT_PRESETS, useMobileTheme } from "@/contexts/MobileThemeContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetProfile, useUpdateProfile } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Check,
  Loader2,
  LogIn,
  Moon,
  Shield,
  Sun,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function ProfilePage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString();
  const { theme, setTheme, accentColor, setAccentColor } = useMobileTheme();

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

        {/* ── Mobile App Settings (mobile only) ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="md:hidden mb-6"
          data-ocid="profile.panel"
        >
          <Card className="border-border shadow-card overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-ui font-semibold flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{ background: `${accentColor}25`, color: accentColor }}
                >
                  {theme === "dark" ? (
                    <Moon className="w-3 h-3" />
                  ) : (
                    <Sun className="w-3 h-3" />
                  )}
                </span>
                App Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Dark/Light toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Theme</p>
                  <p className="text-xs text-muted-foreground">
                    {theme === "dark"
                      ? "Dark mode active"
                      : "Light mode active"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="relative w-[72px] h-9 rounded-full flex items-center p-1 transition-all duration-300"
                  style={{
                    background:
                      theme === "dark"
                        ? "linear-gradient(135deg, #1a1040, #0d0830)"
                        : "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
                    border:
                      theme === "dark"
                        ? "1px solid rgba(139,92,246,0.3)"
                        : "1px solid rgba(99,102,241,0.3)",
                  }}
                  aria-label="Toggle theme"
                  data-ocid="profile.toggle"
                >
                  {/* Icons row */}
                  <span className="absolute left-2 top-1/2 -translate-y-1/2">
                    <Moon
                      className="w-3.5 h-3.5"
                      style={{
                        color:
                          theme === "dark" ? "#A78BFA" : "rgba(99,102,241,0.3)",
                      }}
                    />
                  </span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Sun
                      className="w-3.5 h-3.5"
                      style={{
                        color:
                          theme === "light" ? "#D97706" : "rgba(217,119,6,0.3)",
                      }}
                    />
                  </span>
                  {/* Knob */}
                  <motion.div
                    layout
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        theme === "dark"
                          ? "linear-gradient(135deg, #7C3AED, #6366F1)"
                          : "linear-gradient(135deg, #F59E0B, #FBBF24)",
                      marginLeft: theme === "dark" ? "0" : "auto",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  >
                    {theme === "dark" ? (
                      <Moon className="w-3 h-3 text-white" />
                    ) : (
                      <Sun className="w-3 h-3 text-white" />
                    )}
                  </motion.div>
                </button>
              </div>

              {/* Accent color picker */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Accent Color
                </p>
                <div className="flex items-center gap-3">
                  {ACCENT_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAccentColor(color)}
                      aria-label={`Set accent to ${color}`}
                      className="transition-all duration-200 active:scale-90"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: color,
                        border:
                          accentColor === color
                            ? "3px solid white"
                            : "3px solid transparent",
                        boxShadow:
                          accentColor === color
                            ? `0 0 0 2px ${color}, 0 4px 12px ${color}60`
                            : `0 2px 8px ${color}40`,
                        outline: "none",
                      }}
                      data-ocid="profile.button"
                    />
                  ))}
                </div>
              </div>

              {/* Reset button */}
              <button
                type="button"
                onClick={() => {
                  setTheme("dark");
                  setAccentColor("#FF6B00");
                }}
                className="text-xs font-medium transition-colors"
                style={{ color: "rgba(100,116,139,0.7)" }}
                data-ocid="profile.secondary_button"
              >
                ↺ Reset to defaults
              </button>
            </CardContent>
          </Card>
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
                  {/* Avatar with indigo→violet gradient ring */}
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="relative flex-shrink-0 focus-visible:outline-none group"
                    aria-label="Change profile picture"
                  >
                    {/* Gradient ring */}
                    <div
                      className="w-28 h-28 rounded-full p-[3px] flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7, #7c3aed)",
                        boxShadow:
                          "0 0 20px rgba(139,92,246,0.45), 0 0 40px rgba(139,92,246,0.2)",
                      }}
                    >
                      {/* Inner ring gap */}
                      <div className="w-full h-full rounded-full p-[2px] bg-card">
                        <div className="w-full h-full rounded-full overflow-hidden relative">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                              <span className="text-2xl font-bold font-display bg-gradient-to-br from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                                {initials}
                              </span>
                            </div>
                          )}
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Camera badge */}
                    <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-indigo-500 border-2 border-card flex items-center justify-center shadow-md">
                      <Camera className="w-3.5 h-3.5 text-white" />
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
