"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Camera, Loader2, Plus, Trash2, X } from "lucide-react";
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
  const [isComposerOpen, setIsComposerOpen] = useState(false);
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
  const storyRail = useMemo(() => {
    const seen = new Set<string>();
    return stories.filter((story) => {
      if (seen.has(story.author.id)) {
        return false;
      }
      seen.add(story.author.id);
      return true;
    });
  }, [stories]);

  const openStoryAt = useCallback(
    (storyId: string) => {
      const index = stories.findIndex((item) => item.id === storyId);
      if (index >= 0) {
        setViewerIndex(index);
      }
    },
    [stories]
  );

  function clearComposer() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setSelectedFile(null);
    setCaption("");
    setIsComposerOpen(false);
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
      <div className="overflow-hidden rounded-[18px] border border-[var(--border-color)] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4 md:px-5">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">Stories</h2>
          {storyRail.length ? (
            <button
              className="text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--accent)]"
              onClick={() => openStoryAt(storyRail[0].id)}
              type="button"
            >
              Watch all
            </button>
          ) : null}
        </div>

        {status ? (
          <div className="mx-4 mb-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)] md:mx-5">
            {status}
          </div>
        ) : null}

        <div className="border-t border-[var(--border-color)] px-4 py-4 md:px-5">
          {isLoading ? (
            <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-1">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex shrink-0 flex-col items-center gap-2">
                  <div className="h-[74px] w-[74px] animate-pulse rounded-full bg-[var(--bg-secondary)]" />
                  <div className="h-3 w-16 animate-pulse rounded bg-[var(--bg-secondary)]" />
                </div>
              ))}
            </div>
          ) : storyRail.length || isAuthenticated ? (
            <div className="scrollbar-hide -mx-1 flex gap-4 overflow-x-auto px-1 pb-1">
              {isAuthenticated ? (
                <button className="flex w-[84px] shrink-0 flex-col items-center gap-2" onClick={() => setIsComposerOpen(true)} type="button">
                  <div className="relative flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#d946ef_0%,#f97316_52%,#facc15_100%)] p-[2px]">
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white p-[2px]">
                      <Avatar alt={user?.name || "You"} className="h-full w-full" src={user?.avatarUrl} />
                      <span className="absolute bottom-0 right-0 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[var(--accent)] text-white shadow-sm">
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                  <span className="max-w-[84px] truncate text-center text-xs font-medium text-[var(--text-primary)]">Your Story</span>
                </button>
              ) : null}

              {storyRail.map((story) => (
                <button
                  key={story.author.id}
                  className="flex w-[84px] shrink-0 flex-col items-center gap-2"
                  onClick={() => openStoryAt(story.id)}
                  type="button"
                >
                  <div className={cn("flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#d946ef_0%,#f97316_52%,#facc15_100%)] p-[2px] shadow-[0_8px_18px_rgba(249,115,22,0.18)]")}>
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white p-[2px]">
                      <Avatar alt={story.author.name} className="h-full w-full" src={story.author.avatarUrl || story.url} />
                    </div>
                  </div>
                  <span className="max-w-[84px] truncate text-center text-xs font-medium text-[var(--text-primary)]">{story.isOwnStory ? "Your Story" : story.author.name}</span>
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

      <input
        ref={inputRef}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        type="file"
      />

      {isComposerOpen ? (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-[var(--border-color)] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Add to your story</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Share a photo that stays live for 24 hours.</p>
              </div>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]" onClick={clearComposer} type="button">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <button
                className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden rounded-[24px] border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]"
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                {previewUrl ? (
                  <Image alt="Story preview" className="h-full w-full object-cover" fill sizes="(max-width: 768px) 100vw, 520px" src={previewUrl} />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[var(--text-secondary)]">
                    <Camera className="h-8 w-8" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Choose a story photo</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">JPG, PNG, or WEBP. Best at 1080 x 1920 px.</p>
                    </div>
                  </div>
                )}
              </button>

              <textarea
                className="mt-4 min-h-[96px] w-full resize-none rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                maxLength={160}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Say something about this moment (optional)"
                rows={4}
                value={caption}
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[var(--text-muted)]">{ownStories.length ? `${ownStories.length} active stories right now` : "Your story appears at the top of the feed."}</p>
                <div className="flex gap-2">
                  <button className="button-outline" onClick={clearComposer} type="button">
                    Cancel
                  </button>
                  <button className="button-clean gap-2" disabled={isSubmitting || !selectedFile} onClick={handleCreateStory} type="button">
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
        </div>
      ) : null}

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

          <div className="absolute left-4 right-4 top-3 z-10 mx-auto flex max-w-lg gap-2">
            {stories.map((story, index) => (
              <div key={story.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                <div className={cn("h-full bg-white transition-all", index <= activeViewerIndex ? "w-full" : "w-0")} />
              </div>
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-4 pb-12 pt-24">
            <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
              <div className="relative aspect-[9/16] w-full">
                {activeViewerIndex > 0 ? (
                  <button
                    aria-label="Previous story"
                    className="absolute inset-y-0 left-0 z-10 w-1/3"
                    onClick={() => setViewerIndex((current) => (current === null ? current : Math.max(current - 1, 0)))}
                    type="button"
                  />
                ) : null}
                {activeViewerIndex < stories.length - 1 ? (
                  <button
                    aria-label="Next story"
                    className="absolute inset-y-0 right-0 z-10 w-1/3"
                    onClick={() => setViewerIndex((current) => (current === null ? current : Math.min(current + 1, stories.length - 1)))}
                    type="button"
                  />
                ) : null}
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
                  <p className="text-sm text-white/75">&nbsp;</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
