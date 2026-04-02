"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Send,
  MoreHorizontal,
  BadgeCheck,
  Globe,
  Users,
} from "lucide-react";
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

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const handleDoubleTap = () => {
    if (!liked) {
      handleLike();
      heartRef.current?.classList.add("animate-heart");
      setTimeout(() => heartRef.current?.classList.remove("animate-heart"), 300);
    }
  };

  return (
    <article className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {post.isAnonymous ? (
                <div className="w-full h-full flex items-center justify-center text-[var(--accent)]">
                  A
                </div>
              ) : (
                <Image
                  src={
                    post.author.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`
                  }
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                  width={40}
                  height={40}
                />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-body font-medium text-[var(--text-primary)]">
                {post.isAnonymous ? "Anonymous" : post.author.name}
              </span>
              {post.author.isVerified && !post.isAnonymous && (
                <BadgeCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
              )}
            </div>
            <div className="flex items-center gap-2 text-caption text-[var(--text-muted)]">
              {!post.isAnonymous && (
                <>
                  <span>@{post.author.username}</span>
                  <span>|</span>
                </>
              )}
              {post.author.institution && (
                <>
                  <span className="text-[var(--accent)]">{post.author.institution}</span>
                  <span>|</span>
                </>
              )}
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
        <button className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors hover:text-[var(--text-primary)]">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-body whitespace-pre-wrap leading-relaxed text-[var(--text-primary)]">
          {post.content}
        </p>
      </div>

      {/* Image */}
      {post.images && post.images.length > 0 && (
        <div className="mt-2 relative" onDoubleClick={handleDoubleTap}>
          <div className="grid gap-1">
            {post.images.length === 1 ? (
              <div className="aspect-video bg-[var(--bg-secondary)] overflow-hidden">
                <Image src={post.images[0]} alt="" className="w-full h-full object-cover" width={800} height={450} />
              </div>
            ) : post.images.length === 2 ? (
              <>
                <div className="aspect-square bg-[var(--bg-secondary)] overflow-hidden">
                  <Image src={post.images[0]} alt="" className="w-full h-full object-cover" width={600} height={600} />
                </div>
                <div className="aspect-square bg-[var(--bg-secondary)] overflow-hidden">
                  <Image src={post.images[1]} alt="" className="w-full h-full object-cover" width={600} height={600} />
                </div>
              </>
            ) : post.images.length === 3 ? (
              <>
                <div className="row-span-2 aspect-square bg-[var(--bg-secondary)] overflow-hidden">
                  <Image src={post.images[0]} alt="" className="w-full h-full object-cover" width={800} height={800} />
                </div>
                <div className="aspect-square bg-[var(--bg-secondary)] overflow-hidden">
                  <Image src={post.images[1]} alt="" className="w-full h-full object-cover" width={600} height={600} />
                </div>
                <div className="aspect-square bg-[var(--bg-secondary)] overflow-hidden">
                  <Image src={post.images[2]} alt="" className="w-full h-full object-cover" width={600} height={600} />
                </div>
              </>
            ) : (
              <>
                {post.images.slice(0, 3).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-[var(--bg-secondary)] overflow-hidden">
                    <Image src={img} alt="" className="w-full h-full object-cover" width={600} height={600} />
                  </div>
                ))}
                <div className="aspect-square bg-[var(--bg-secondary)] overflow-hidden relative">
                  <Image src={post.images[3]} alt="" className="w-full h-full object-cover" width={600} height={600} />
                  {post.images.length > 4 && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-white text-[var(--text-primary)] text-sm">+{post.images.length - 4}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Double tap heart overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100">
            <div ref={heartRef} className="animate-heart hidden">
              <Heart className="h-12 w-12 text-[var(--accent)] fill-[var(--accent)]" />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={cn(
                "p-2 rounded-md transition-colors hover:bg-[var(--bg-secondary)]",
                liked ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className={cn(
              "p-2 rounded-md transition-colors hover:bg-[var(--bg-secondary)]",
              saved ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
          </button>
        </div>

        {/* Likes count */}
        <div className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
          {likesCount.toLocaleString()} likes
        </div>

        {/* Caption preview */}
        {!showComments && post.commentsCount > 0 && (
          <button
            onClick={() => setShowComments(true)}
            className="text-sm text-[var(--text-muted)] mt-2 hover:text-[var(--text-primary)]"
          >
            View all {post.commentsCount} comments
          </button>
        )}

        {/* Comments section */}
        {showComments && (
          <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
            <div className="space-y-3 mb-3">
              {[
                { user: "amit_k", text: "Great post!", time: "1h" },
                { user: "sneha_123", text: "This is exactly what we needed!", time: "45m" },
              ].map((comment, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium text-[var(--text-primary)]">{comment.user}</span>{" "}
                  <span className="text-[var(--text-secondary)]">{comment.text}</span>
                </div>
              ))}
            </div>

            {/* Comment input */}
            <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-color)]">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 input-clean text-body"
              />
              <button disabled={!commentText.trim()} className="button-clean px-4">
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
