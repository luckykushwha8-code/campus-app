"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    images?: string[];
    author: {
      id: string;
      name: string;
      username: string;
      avatar?: string;
      institution?: string;
      isVerified?: boolean;
    };
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    isSaved: boolean;
    isAnonymous?: boolean;
    createdAt: string;
  };
}

export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked);
  const [saved, setSaved] = useState(post.isSaved);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const heartRef = useRef<HTMLDivElement>(null);

  function handleLike() {
    setLiked((value) => !value);
    setLikesCount((value) => (liked ? value - 1 : value + 1));
  }

  function handleDoubleTap() {
    if (!liked) {
      handleLike();
      heartRef.current?.classList.add("animate-heart");
      setTimeout(() => heartRef.current?.classList.remove("animate-heart"), 300);
    }
  }

  return (
    <article className="app-surface overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 overflow-hidden rounded-full">
            {post.isAnonymous ? (
              <div className="flex h-full w-full items-center justify-center bg-[var(--bg-secondary)] text-sm font-semibold text-[var(--accent)]">
                A
              </div>
            ) : (
              <Image
                src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`}
                alt={post.author.name}
                className="h-full w-full object-cover"
                width={44}
                height={44}
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {post.isAnonymous ? "Anonymous" : post.author.name}
              </span>
              {post.author.isVerified && !post.isAnonymous ? <BadgeCheck className="h-3.5 w-3.5 text-[var(--accent)]" /> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
              {!post.isAnonymous ? <span>@{post.author.username}</span> : null}
              {post.author.institution ? <span>{post.author.institution}</span> : null}
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <button className="app-panel flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)]" type="button">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pb-4">
        <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-primary)]">{post.content}</p>
      </div>

      {post.images?.length ? (
        <div className="relative px-4 pb-4" onDoubleClick={handleDoubleTap}>
          <div className="overflow-hidden rounded-2xl bg-[var(--bg-secondary)]">
            <Image src={post.images[0]} alt="" className="h-full w-full object-cover" width={900} height={520} />
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100">
            <div ref={heartRef} className="hidden">
              <Heart className="h-14 w-14 fill-[var(--accent)] text-[var(--accent)]" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="border-t border-[var(--border-color)] px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={cn(
                "app-panel flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                liked ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
              type="button"
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            </button>
            <button
              onClick={() => setShowComments((value) => !value)}
              className="app-panel flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              type="button"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
            <button className="app-panel flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]" type="button">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setSaved((value) => !value)}
            className={cn(
              "app-panel flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              saved ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
            type="button"
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
          </button>
        </div>

        <div className="mt-3 text-sm font-medium text-[var(--text-secondary)]">{likesCount.toLocaleString()} likes</div>

        {!showComments && post.commentsCount > 0 ? (
          <button onClick={() => setShowComments(true)} className="mt-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]" type="button">
            View all {post.commentsCount} comments
          </button>
        ) : null}

        {showComments ? (
          <div className="mt-4 border-t border-[var(--border-color)] pt-4">
            <div className="mb-3 space-y-3">
              {[
                { user: "amit_k", text: "Great post!" },
                { user: "sneha_123", text: "This is exactly what we needed." },
              ].map((comment, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium text-[var(--text-primary)]">{comment.user}</span>{" "}
                  <span className="text-[var(--text-secondary)]">{comment.text}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 border-t border-[var(--border-color)] pt-3">
              <input
                type="text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a comment..."
                className="input-clean flex-1 text-body"
              />
              <button disabled={!commentText.trim()} className="button-clean px-4" type="button">
                Post
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
