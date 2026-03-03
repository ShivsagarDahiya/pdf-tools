import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Heart,
  Loader2,
  MessageCircle,
  Send,
  Star,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Product {
  id: bigint;
  title: string;
  description: string;
  category: string;
  price: bigint;
  isFree: boolean;
  tags: string[];
  fileUrl: string;
  paymentLink: string;
  creatorPrincipal: string;
  downloadCount: bigint;
  createdAt: bigint;
}

interface CreatorProfile {
  displayName: string;
  bio: string;
  category: string;
  profileType: string;
  socialLinks: string[];
  githubUrl: string;
  contactEmail: string;
  websiteUrl: string;
  profilePicUrl: string;
  createdAt: bigint;
}

interface Comment {
  id: bigint;
  authorPrincipal: string;
  text: string;
  createdAt: bigint;
}

export function ProductDetail() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [product, setProduct] = useState<Product | null>(null);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [avgRating, setAvgRating] = useState(4);
  const [myRating, setMyRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("");
  const [isTipping, setIsTipping] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (!actor || isFetching || !id) return;
      setIsLoading(true);
      try {
        const [prod, comms, lc, liked_, avgR] = await Promise.all([
          typeof (actor as any).getProduct === "function"
            ? (actor as any).getProduct(BigInt(id))
            : Promise.resolve(null),
          typeof (actor as any).getComments === "function"
            ? (actor as any).getComments(`product:${id}`)
            : Promise.resolve([]),
          typeof (actor as any).getLikeCount === "function"
            ? (actor as any).getLikeCount(`product:${id}`)
            : Promise.resolve(BigInt(0)),
          identity && typeof (actor as any).hasLiked === "function"
            ? (actor as any).hasLiked(`product:${id}`)
            : Promise.resolve(false),
          typeof (actor as any).getAverageRating === "function"
            ? (actor as any).getAverageRating(`product:${id}`)
            : Promise.resolve(BigInt(4)),
        ]);

        if (prod) {
          setProduct(prod);
          setLikeCount(Number(lc || 0));
          setLiked(liked_ || false);
          setAvgRating(Number(avgR || 4));
          setComments(comms || []);

          // Load creator
          if (
            prod.creatorPrincipal &&
            typeof (actor as any).getCreatorProfile === "function"
          ) {
            try {
              const creatorData = await (actor as any).getCreatorProfile(
                prod.creatorPrincipal,
              );
              setCreator(creatorData || null);
              if (
                identity &&
                typeof (actor as any).isFollowing === "function"
              ) {
                const following = await (actor as any).isFollowing(
                  prod.creatorPrincipal,
                );
                setIsFollowing(following || false);
              }
            } catch {}
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [actor, isFetching, id, identity]);

  const handleLike = async () => {
    if (!identity) {
      toast.error("Please sign in to like");
      return;
    }
    if (!actor) return;
    try {
      if (liked) {
        if (typeof (actor as any).unlikeItem === "function") {
          await (actor as any).unlikeItem(`product:${id}`);
          setLiked(false);
          setLikeCount((c) => Math.max(0, c - 1));
        }
      } else {
        if (typeof (actor as any).likeItem === "function") {
          await (actor as any).likeItem(`product:${id}`);
          setLiked(true);
          setLikeCount((c) => c + 1);
        }
      }
    } catch {
      toast.error("Failed to like");
    }
  };

  const handleFollow = async () => {
    if (!identity) {
      toast.error("Please sign in to follow");
      return;
    }
    if (!actor || !product) return;
    try {
      if (isFollowing) {
        if (typeof (actor as any).unfollow === "function") {
          await (actor as any).unfollow(product.creatorPrincipal);
          setIsFollowing(false);
        }
      } else {
        if (typeof (actor as any).follow === "function") {
          await (actor as any).follow(product.creatorPrincipal);
          setIsFollowing(true);
        }
      }
    } catch {
      toast.error("Failed to update follow");
    }
  };

  const handleRating = async (score: number) => {
    if (!identity) {
      toast.error("Please sign in to rate");
      return;
    }
    if (!actor) return;
    setMyRating(score);
    try {
      if (typeof (actor as any).rateItem === "function") {
        await (actor as any).rateItem(
          `product:${id}`,
          BigInt(score),
          reviewText,
        );
        toast.success("Rating submitted!");
      }
    } catch {
      toast.error("Failed to submit rating");
    }
  };

  const handleComment = async () => {
    if (!identity) {
      toast.error("Please sign in to comment");
      return;
    }
    if (!commentText.trim() || !actor) return;
    setIsSubmittingComment(true);
    try {
      if (typeof (actor as any).addComment === "function") {
        const newId = await (actor as any).addComment(
          `product:${id}`,
          commentText.trim(),
        );
        const newComment: Comment = {
          id: newId || BigInt(Date.now()),
          authorPrincipal: identity.getPrincipal().toString(),
          text: commentText.trim(),
          createdAt: BigInt(Date.now()),
        };
        setComments((prev) => [newComment, ...prev]);
        setCommentText("");
        toast.success("Comment posted!");
      }
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: bigint) => {
    if (!actor) return;
    try {
      if (typeof (actor as any).deleteComment === "function") {
        await (actor as any).deleteComment(commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const handleTip = async () => {
    if (!identity) {
      toast.error("Please sign in to send a tip");
      return;
    }
    if (!product || !actor) return;
    const amount = Number.parseFloat(tipAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setIsTipping(true);
    try {
      if (typeof (actor as any).recordTip === "function") {
        await (actor as any).recordTip(
          product.creatorPrincipal,
          BigInt(Math.round(amount * 100)),
          tipMessage,
        );
        toast.success(`Tip of $${amount.toFixed(2)} sent! 🎉`);
        setTipOpen(false);
        setTipAmount("");
        setTipMessage("");
      }
    } catch {
      toast.error("Failed to send tip");
    } finally {
      setIsTipping(false);
    }
  };

  const handleDownload = async () => {
    if (!product) return;
    if (product.isFree && product.fileUrl) {
      window.open(product.fileUrl, "_blank");
      if (
        actor &&
        typeof (actor as any).incrementProductDownload === "function"
      ) {
        try {
          await (actor as any).incrementProductDownload(product.id);
        } catch {}
      }
    } else if (!product.isFree && product.paymentLink) {
      window.open(product.paymentLink, "_blank");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container max-w-5xl py-8">
          <Skeleton className="h-6 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-display font-semibold text-xl text-foreground mb-4">
            Product not found
          </p>
          <Link to="/marketplace">
            <Button>Browse Marketplace</Button>
          </Link>
        </div>
      </main>
    );
  }

  const priceDisplay = product.isFree
    ? "Free"
    : `$${(Number(product.price) / 100).toFixed(2)}`;
  const myPrincipal = identity?.getPrincipal().toString();

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card/50">
        <div className="container max-w-5xl py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground font-ui">
            <Link
              to="/marketplace"
              className="hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Marketplace
            </Link>
            <span className="mx-1">/</span>
            <span className="text-foreground truncate max-w-[200px]">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="container max-w-5xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <Badge className="mb-2 font-ui" variant="secondary">
                    {product.category}
                  </Badge>
                  <h1 className="font-display font-bold text-2xl text-foreground mb-2">
                    {product.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground font-ui">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" />
                      {Number(product.downloadCount).toLocaleString()} downloads
                    </span>
                    <button
                      type="button"
                      onClick={handleLike}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${liked ? "fill-red-500 text-red-500" : ""}`}
                      />
                      {likeCount}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground font-ui leading-relaxed">
                {product.description}
              </p>

              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {product.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="font-ui text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Rating Widget */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  Rate this product
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleRating(s)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${s <= myRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                      />
                    </button>
                  ))}
                </div>
                {myRating > 0 && (
                  <>
                    <Textarea
                      placeholder="Write a review (optional)..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="font-ui text-sm"
                      rows={2}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleRating(myRating)}
                      className="font-ui"
                    >
                      Submit Review
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {identity && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleComment();
                          }
                        }}
                        className="font-ui text-sm flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={handleComment}
                        disabled={!commentText.trim() || isSubmittingComment}
                        className="font-ui gap-1"
                      >
                        {isSubmittingComment ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                {comments.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm font-ui py-4">
                    No comments yet. Be the first!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id.toString()} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xs font-bold font-ui text-muted-foreground">
                          {comment.authorPrincipal.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs text-muted-foreground font-ui">
                              {comment.authorPrincipal.slice(0, 8)}…
                            </p>
                            {myPrincipal === comment.authorPrincipal && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-foreground font-ui mt-0.5">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Buy/Download Card */}
            <Card className="border-border sticky top-20">
              <CardContent className="p-5 space-y-4">
                <div className="text-center">
                  <span
                    className={`font-display font-bold text-3xl ${product.isFree ? "text-green-600" : "text-primary"}`}
                  >
                    {priceDisplay}
                  </span>
                </div>
                <Button
                  className="w-full font-ui gap-2"
                  onClick={handleDownload}
                >
                  {product.isFree ? (
                    <>
                      <Download className="w-4 h-4" /> Download Free
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" /> Get for{" "}
                      {priceDisplay}
                    </>
                  )}
                </Button>

                <Dialog open={tipOpen} onOpenChange={setTipOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full font-ui gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                    >
                      <Zap className="w-4 h-4" />
                      Thank Creator
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display">
                        Send a Tip
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="font-ui">Amount ($)</Label>
                        <Input
                          type="number"
                          value={tipAmount}
                          onChange={(e) => setTipAmount(e.target.value)}
                          placeholder="5.00"
                          min="0.50"
                          step="0.50"
                          className="font-ui"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-ui">Message (optional)</Label>
                        <Textarea
                          value={tipMessage}
                          onChange={(e) => setTipMessage(e.target.value)}
                          placeholder="Great work! Keep it up..."
                          className="font-ui text-sm"
                          rows={2}
                        />
                      </div>
                      <Button
                        className="w-full font-ui gap-2"
                        onClick={handleTip}
                        disabled={isTipping}
                      >
                        {isTipping ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        Send Tip
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Separator />

                {/* Creator Info */}
                {creator ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground font-ui font-semibold uppercase tracking-wider">
                      Creator
                    </p>
                    <a
                      href={`/creator/${product.creatorPrincipal}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden flex-shrink-0">
                        {creator.profilePicUrl ? (
                          <img
                            src={creator.profilePicUrl}
                            alt={creator.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary font-bold font-ui text-sm">
                            {creator.displayName?.slice(0, 2).toUpperCase() ||
                              "??"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-ui font-semibold text-sm text-foreground">
                          {creator.displayName}
                        </p>
                        <p className="font-ui text-xs text-muted-foreground">
                          {creator.category}
                        </p>
                      </div>
                    </a>
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      className="w-full font-ui"
                      onClick={handleFollow}
                    >
                      {isFollowing ? "Following ✓" : "Follow Creator"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <a
                      href={`/creator/${product.creatorPrincipal}`}
                      className="text-xs text-primary hover:underline font-ui"
                    >
                      View Creator Profile →
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
