"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useAppSession } from "@/hooks/use-app-session";
import { cn } from "@/lib/utils";

type StoryItem = {
  id: string;
  url: string;
  type: "image" | "video";
  caption?: string;
  createdAt: string;
  expiresAt: string;
  isOwnStory: boolean;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
};

export function Stories() {
  const { isAuthenticated, token, user } = useAppSession();
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadStories = useCallback(async () => {
    setIsLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/stories/feed", {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus(data.error || "Unable to load stories right now.");
        setStories([]);
        return;
      }

      setStories(data.stories || []);
    } catch {
      setStatus("Unable to load stories right now.");
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const viewedStory = viewerIndex === null ? null : stories[viewerIndex] || null;
  const activeViewerIndex = viewerIndex ?? 0;
  const ownStories = useMemo(() => stories.filter((story) => story.isOwnStory), [stories]);

  function clearComposer() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setSelectedFile(null);
    setCaption("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatus("Choose a JPG, PNG, or WEBP image for your story.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus("Choose an image smaller than 5MB.");
      event.target.value = "";
      return;
    }

    clearComposer();
    const nextUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(nextUrl);
    setStatus("");
  }

  async function handleCreateStory() {
    if (!isAuthenticated || !token) {
      setStatus("Please log in to add a story.");
      return;
    }
    if (!selectedFile) {
      setStatus("Choose an image before posting your story.");
      return;
    }

    setIsSubmitting(true);
    setStatus("");
    try {
      const uploadData = new FormData();
      uploadData.append("file", selectedFile);
      uploadData.append("kind", "story");

      const uploadResponse = await fetch("/api/media/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });
      const uploaded = await uploadResponse.json();
      if (!uploadResponse.ok || !uploaded.ok || !uploaded.asset?.url) {
        setStatus(uploaded.error || "Unable to upload your story image.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/stories/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: uploaded.asset.url,
          caption: caption.trim(),
          type: "image",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok || !data.story) {
        setStatus(data.error || "Unable to create your story right now.");
        setIsSubmitting(false);
        return;
      }

      setStories((current) => [data.story, ...current]);
      clearComposer();
      setStatus("Story shared for the next 24 hours.");
    } catch {
      setStatus("Unable to create your story right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteStory(storyId: string) {
    if (!token) {
      return;
    }

    setIsDeleting(true);
    setStatus("");
    try {
      const response = await fetch("/api/stories/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storyId }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus(data.error || "Unable to delete this story.");
        return;
      }

      setStories((current) => current.filter((story) => story.id !== storyId));
      setViewerIndex(null);
      setStatus("Story deleted.");
    } catch {
      setStatus("Unable to delete this story.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="app-surface p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Stories</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Quick campus updates that disappear after 24 hours.</p>
          </div>
          <button className="button-outline" onClick={loadStories} type="button">
            Refresh
          </button>
        </div>

        {isAuthenticated ? (
          <div className="mt-4 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <button
                className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-dashed border-[var(--border-color)] bg-white"
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                {previewUrl ? (
                  <Image alt="Story preview" className="h-full w-full object-cover" height={80} src={previewUrl} width={80} />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-[var(--text-secondary)]">
                    <Plus className="h-5 w-5" />
                    <span className="text-xs font-medium">Add story</span>
                  </div>
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Avatar alt={user?.name || "You"} className="h-10 w-10" src={user?.avatarUrl} />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.name || "You"}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{ownStories.length ? `${ownStories.length} active stories` : "No active stories yet"}</p>
                  </div>
                </div>

                <textarea
                  className="mt-3 min-h-[88px] w-full resize-none rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                  maxLength={160}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="Add a quick caption (optional)"
                  rows={3}
                  value={caption}
                />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-[var(--text-muted)]">Image stories only right now. Best size: 1080 x 1920 px.</p>
                  <div className="flex gap-2">
                    {selectedFile ? (
                      <button className="button-outline" onClick={clearComposer} type="button">
                        Clear
                      </button>
                    ) : null}
                    <button className="button-clean" disabled={isSubmitting || !selectedFile} onClick={handleCreateStory} type="button">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sharing...
                        </>
                      ) : (
                        "Share Story"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <input
              ref={inputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
              type="file"
            />
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-4 text-sm text-[var(--text-secondary)]">
            Log in to share campus stories.
          </div>
        )}

        {status ? (
          <div className="mt-4 rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
            {status}
          </div>
        ) : null}

        <div className="mt-4">
          {isLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex shrink-0 flex-col items-center gap-2">
                  <div className="h-16 w-16 animate-pulse rounded-full bg-[var(--bg-secondary)]" />
                  <div className="h-3 w-14 animate-pulse rounded bg-[var(--bg-secondary)]" />
                </div>
              ))}
            </div>
          ) : stories.length ? (
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
              {stories.map((story, index) => (
                <button key={story.id} className="flex shrink-0 flex-col items-center gap-2" onClick={() => setViewerIndex(index)} type="button">
                  <div className={cn("flex h-16 w-16 items-center justify-center rounded-full p-0.5", story.isOwnStory ? "bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_100%)]" : "bg-[linear-gradient(135deg,#2563eb_0%,#38bdf8_100%)]")}>
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                      <Avatar alt={story.author.name} className="h-full w-full" src={story.author.avatarUrl || story.url} />
                    </div>
                  </div>
                  <span className="max-w-[72px] truncate text-xs text-[var(--text-secondary)]">{story.isOwnStory ? "Your story" : story.author.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-white px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
              No active stories yet. Be the first to share a campus moment.
            </div>
          )}
        </div>
      </div>

      {viewedStory ? (
        <div className="fixed inset-0 z-[70] bg-black/90">
          <div className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-lg items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar alt={viewedStory.author.name} className="h-10 w-10 border border-white/15" src={viewedStory.author.avatarUrl || viewedStory.url} />
              <div>
                <p className="text-sm font-semibold text-white">{viewedStory.author.name}</p>
                <p className="text-xs text-white/70">{formatDistanceToNow(new Date(viewedStory.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {viewedStory.isOwnStory ? (
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50"
                  disabled={isDeleting}
                  onClick={() => handleDeleteStory(viewedStory.id)}
                  type="button"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              ) : null}
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20" onClick={() => setViewerIndex(null)} type="button">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="absolute left-4 right-4 top-16 z-10 mx-auto flex max-w-lg gap-2">
            {stories.map((story, index) => (
              <div key={story.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                <div className={cn("h-full bg-white transition-all", index <= activeViewerIndex ? "w-full" : "w-0")} />
              </div>
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-4 pb-12 pt-24">
            <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
              <div className="relative aspect-[9/16] w-full">
                <Image
                  alt={viewedStory.caption || `${viewedStory.author.name}'s story`}
                  className="h-full w-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  src={viewedStory.url}
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5">
                {viewedStory.caption ? (
                  <p className="text-sm leading-6 text-white">{viewedStory.caption}</p>
                ) : (
                  <p className="text-sm text-white/75">No caption for this story.</p>
                )}
              </div>
            </div>
          </div>

          {activeViewerIndex > 0 ? (
            <button
              className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/20 md:block"
              onClick={() => setViewerIndex((current) => (current === null ? current : Math.max(current - 1, 0)))}
              type="button"
            >
              Previous
            </button>
          ) : null}

          {activeViewerIndex < stories.length - 1 ? (
            <button
              className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/20 md:block"
              onClick={() => setViewerIndex((current) => (current === null ? current : Math.min(current + 1, stories.length - 1)))}
              type="button"
            >
              Next
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
