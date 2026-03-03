import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Bell, BellOff, Check, CheckCheck, Loader2, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Notification {
  id: bigint;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: bigint;
}

function timeAgo(timestamp: bigint): string {
  const now = Date.now();
  const diff = now - Number(timestamp);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(Number(timestamp)).toLocaleDateString();
}

export function NotificationsPage() {
  const { actor, isFetching } = useActor();
  const { identity, login } = useInternetIdentity();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    async function load() {
      if (!actor || isFetching || !identity) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        if (typeof (actor as any).getMyNotifications === "function") {
          const notifs = await (actor as any).getMyNotifications();
          setNotifications(notifs || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [actor, isFetching, identity]);

  const handleMarkRead = async (id: bigint) => {
    if (!actor) return;
    try {
      if (typeof (actor as any).markNotificationRead === "function") {
        await (actor as any).markNotificationRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      }
    } catch {}
  };

  const handleMarkAllRead = async () => {
    if (!actor) return;
    setIsMarkingAll(true);
    try {
      if (typeof (actor as any).markAllNotificationsRead === "function") {
        await (actor as any).markAllNotificationsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read");
      }
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!identity) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-sm border-border">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Bell className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg text-foreground mb-1">
                Sign In to View Notifications
              </h2>
              <p className="text-sm text-muted-foreground font-ui">
                Your notifications will appear here after signing in
              </p>
            </div>
            <Button className="w-full font-ui gap-2" onClick={login}>
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-3xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="font-display font-bold text-2xl text-foreground">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground font-ui text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="font-ui gap-2 text-xs"
              >
                {isMarkingAll ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
                Mark all read
              </Button>
            )}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
              <Card key={i} className="border-border">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h2 className="font-display font-semibold text-lg text-muted-foreground mb-2">
              No notifications yet
            </h2>
            <p className="text-sm text-muted-foreground font-ui">
              You'll receive notifications about your products, followers, and
              tips here
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            {notifications.map((notif, i) => (
              <motion.div
                key={notif.id.toString()}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <Card
                  className={`border-border transition-colors cursor-pointer hover:bg-muted/20 ${!notif.isRead ? "border-primary/30 bg-primary/5" : ""}`}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.isRead ? "bg-muted" : "bg-primary/10"}`}
                      >
                        <Bell
                          className={`w-4 h-4 ${notif.isRead ? "text-muted-foreground" : "text-primary"}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className={`font-ui font-semibold text-sm ${notif.isRead ? "text-foreground" : "text-foreground"}`}
                            >
                              {notif.title}
                            </p>
                            <p className="text-xs text-muted-foreground font-ui mt-0.5 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notif.isRead && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                            {notif.isRead && (
                              <Check className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-ui mt-1.5">
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
