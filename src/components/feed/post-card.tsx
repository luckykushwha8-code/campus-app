"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Heart, MessageCircle, BadgeCheck, Trash2, Loader2, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useAppSession } from "@/hooks/use-app-session";
import type { FeedComment, FeedPost } from "@/components/feed/types";

interface PostCardProps {
  post: FeedPost;
  onDeleted?: (postId: string) => void;
  onUpdated?: (post: FeedPost) => void;
}

export function PostCard({ post, onDeleted, onUpdated }: PostCardProps) {
  const { token, isAuthenticated, user } = useAppSession();
  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentStatus, setCommentStatus] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  async function loadComments(force = false) {
    if ((commentsLoaded && !force) || commentsLoading) {
      return;
    }

    setCommentsLoading(true);
    setCommentStatus("");
    try {
      const response = await fetch(`/api/posts/comments?postId=${post.id}`, {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setCommentStatus(data.error || "Unable to load comments right now.");
        return;
      }

      setComments(data.comments || []);
      setCommentsLoaded(true);
    } catch {
      setCommentStatus("Unable to load comments right now.");
    } finally {
      setCommentsLoading(false);
    }
  }

  const authorHref =
    !post.isAnonymous && post.author.id
      ? post.author.id === user?.id
        ? "/profile"
        : `/profile/${post.author.id}`
      : null;

  async function handleToggleComments() {
    const next = !showComments;
    setShowComments(next);
    if (next) {
      await loadComments();
    }
  }

  async function handleLike() {
    if (!isAuthenticated || !token || isLiking) {
      return;
    }

    const previousLiked = liked;
    const previousCount = likesCount;
    const nextLiked = !liked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

    setLiked(nextLiked);
    setLikesCount(nextCount);
    setIsLiking(true);

    try {
      const response = await fetch("/api/posts/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: post.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setLiked(previousLiked);
        setLikesCount(previousCount);
        return;
      }

      setLiked(Boolean(data.liked));
      setLikesCount(Number(data.likesCount || 0));
      onUpdated?.({ ...post, isLiked: Boolean(data.liked), likesCount: Number(data.likesCount || 0), commentsCount });
    } catch {
      setLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  }

  async function handleSubmitComment() {
    if (!isAuthenticated || !token || !commentText.trim() || isSubmittingComment) {
      return;
    }

    setIsSubmittingComment(true);
    setCommentStatus("");

    try {
      const response = await fetch("/api/posts/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: post.id,
          content: commentText.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok || !data.comment) {
        setCommentStatus(data.error || "Unable to add your comment.");
        return;
      }

      const nextCommentsCount = Number(data.commentsCount || commentsCount + 1);
      setComments((current) => [...current, data.comment]);
      setCommentsCount(nextCommentsCount);
      setCommentText("");
      setCommentsLoaded(true);
      onUpdated?.({
        ...post,
        isLiked: liked,
        likesCount,
        commentsCount: nextCommentsCount,
      });
    } catch {
      setCommentStatus("Unable to add your comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setCommentStatus(data.error || "Unable to delete the comment.");
        return;
      }

      const nextCommentsCount = Math.max(0, commentsCount - 1);
      setComments((current) => current.filter((item) => item.id !== commentId));
      setCommentsCount(nextCommentsCount);
      onUpdated?.({ ...post, isLiked: liked, likesCount, commentsCount: nextCommentsCount });
    } catch {
      setCommentStatus("Unable to delete the comment.");
    }
  }

  async function handleDeletePost() {
    if (!token || !post.isOwner || isDeleting) {
      return;
    }

    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setCommentStatus(data.error || "Unable to delete the post.");
        return;
      }

      onDeleted?.(post.id);
    } catch {
      setCommentStatus("Unable to delete the post.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleReport(targetType: "post" | "comment", targetId: string) {
    if (!token || isReporting) {
      return;
    }

    const reason = window.prompt("Why are you reporting this content?", "Spam or abuse");
    if (!reason?.trim()) {
      return;
    }

    setIsReporting(true);
    try {
      const response = await fetch("/api/moderation/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType,
          targetId,
          reason: reason.trim(),
        }),
      });
      const data = await response.json();
      setCommentStatus(data.ok ? "Report submitted. Thanks for helping keep CampusLink safe." : data.error || "Unable to submit the report.");
    } catch {
      setCommentStatus("Unable to submit the report.");
    } finally {
      setIsReporting(false);
    }
  }

  return (
    <article className="app-surface overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {authorHref ? (
            <Link href={authorHref}>
              <Avatar alt={post.author.name} src={post.author.avatarUrl} className="h-11 w-11" />
            </Link>
          ) : (
            <Avatar alt={post.isAnonymous ? "Anonymous" : post.author.name} src={post.isAnonymous ? "" : post.author.avatarUrl} className="h-11 w-11" />
          )}
          <div>
            <div className="flex items-center gap-2">
              {authorHref ? (
                <Link className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]" href={authorHref}>
                  {post.author.name}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {post.isAnonymous ? "Anonymous" : post.author.name}
                </span>
              )}
              {post.author.isVerified && !post.isAnonymous ? <BadgeCheck className="h-3.5 w-3.5 text-[var(--accent)]" /> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
              {!post.isAnonymous ? <span>@{post.author.username}</span> : null}
              {post.author.institution ? <span>{post.author.institution}</span> : null}
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!post.isOwner && post.canReport ? (
            <button className="app-panel flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--accent)]" onClick={() => handleReport("post", post.id)} type="button">
              {isReporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
            </button>
          ) : null}
          {post.isOwner ? (
            <button className="app-panel flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-red-600" onClick={handleDeletePost} type="button">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-4 pb-4">
        <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-primary)]">{post.content}</p>
      </div>

      {post.images?.length ? (
        <div className="relative px-4 pb-4">
          <div className="overflow-hidden rounded-2xl bg-[var(--bg-secondary)]">
            <Image src={post.images[0]} alt="" className="h-full w-full object-cover" width={900} height={520} />
          </div>
        </div>
      ) : null}

      <div className="border-t border-[var(--border-color)] px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            disabled={!isAuthenticated || isLiking}
            className={cn(
              "app-panel flex h-10 min-w-[84px] items-center justify-center gap-2 rounded-xl px-3 transition-colors",
              liked ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
            type="button"
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            <span className="text-sm">{likesCount}</span>
          </button>
          <button
            onClick={handleToggleComments}
            className="app-panel flex h-10 min-w-[92px] items-center justify-center gap-2 rounded-xl px-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            type="button"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{commentsCount}</span>
          </button>
        </div>

        {showComments ? (
          <div className="mt-4 border-t border-[var(--border-color)] pt-4">
            {commentStatus ? (
              <div className="mb-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                {commentStatus}
              </div>
            ) : null}

            {commentsLoading ? (
              <div className="mb-3 text-sm text-[var(--text-secondary)]">Loading comments...</div>
            ) : comments.length ? (
              <div className="mb-3 space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)]" href={comment.author.id === user?.id ? "/profile" : `/profile/${comment.author.id}`}>
                            {comment.author.name}
                          </Link>
                          <span className="text-xs text-[var(--text-muted)]">@{comment.author.username}</span>
                          <span className="text-xs text-[var(--text-muted)]">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-[var(--text-secondary)]">{comment.content}</p>
                      </div>
                      {comment.isOwner ? (
                        <button className="text-xs font-medium text-red-600" onClick={() => handleDeleteComment(comment.id)} type="button">
                          Delete
                        </button>
                      ) : comment.canReport ? (
                        <button className="text-xs font-medium text-[var(--accent)]" onClick={() => handleReport("comment", comment.id)} type="button">
                          Report
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-3 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-6 text-sm text-[var(--text-secondary)]">
                No comments yet. Start the conversation.
              </div>
            )}

            <div className="flex items-center gap-3 border-t border-[var(--border-color)] pt-3">
              <input
                type="text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a comment..."
                className="input-clean flex-1 text-body"
                maxLength={500}
              />
              <button disabled={!commentText.trim() || isSubmittingComment} className="button-clean px-4" onClick={handleSubmitComment} type="button">
                {isSubmittingComment ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
