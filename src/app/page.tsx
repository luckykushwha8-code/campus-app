"use client";

import { useCallback, useEffect, useState } from "react";
import { CreatePost, PostCard } from "@/components/feed";
import type { FeedPost } from "@/components/feed/types";
import { useAppSession } from "@/hooks/use-app-session";

export default function HomePage() {
  const { token } = useAppSession();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const loadPosts = useCallback(
    async ({ reset = false, cursor }: { reset?: boolean; cursor?: string | null } = {}) => {
      const isReset = reset || !cursor;
      if (isReset) {
        setError("");
        if (reset) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
      } else {
        setIsLoadingMore(true);
      }

      try {
        const params = new URLSearchParams({ limit: "10" });
        if (cursor) {
          params.set("cursor", cursor);
        }

        const response = await fetch(`/api/posts/feed?${params.toString()}`, {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await response.json();

        if (!response.ok || !data.ok) {
          setError(data.error || "Unable to load the feed right now.");
          return;
        }

        setPosts((current) => (cursor ? [...current, ...(data.posts || [])] : data.posts || []));
        setNextCursor(data.nextCursor || null);
      } catch {
        setError("Unable to load the feed right now.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [token]
  );

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-3xl space-y-5">
        <CreatePost onCreated={(post) => setPosts((current) => [post, ...current])} />

        {error ? (
          <div className="app-surface p-5">
            <p className="text-sm text-[var(--text-secondary)]">{error}</p>
            <button className="button-clean mt-4" onClick={() => loadPosts({ reset: true })} type="button">
              Retry
            </button>
          </div>
        ) : null}

        <div className="flex justify-end">
          <button className="button-outline" disabled={isRefreshing} onClick={() => loadPosts({ reset: true })} type="button">
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="app-surface animate-pulse p-5">
                <div className="h-4 w-1/3 rounded bg-[var(--bg-secondary)]" />
                <div className="mt-4 h-3 w-full rounded bg-[var(--bg-secondary)]" />
                <div className="mt-2 h-3 w-5/6 rounded bg-[var(--bg-secondary)]" />
                <div className="mt-4 h-48 rounded-2xl bg-[var(--bg-secondary)]" />
              </div>
            ))}
          </div>
        ) : posts.length ? (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDeleted={(postId) => setPosts((current) => current.filter((item) => item.id !== postId))}
                onUpdated={(updatedPost) =>
                  setPosts((current) =>
                    current.map((item) =>
                      item.id === updatedPost.id
                        ? { ...item, likesCount: updatedPost.likesCount, commentsCount: updatedPost.commentsCount, isLiked: updatedPost.isLiked }
                        : item
                    )
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="app-surface p-6 text-center">
            <p className="text-lg font-semibold text-[var(--text-primary)]">Your feed is empty</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Create the first post to start your campus conversation.</p>
          </div>
        )}

        {nextCursor ? (
          <div className="pb-6 text-center">
            <button className="button-outline" disabled={isLoadingMore} onClick={() => loadPosts({ cursor: nextCursor })} type="button">
              {isLoadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
