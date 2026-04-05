"use client";

import { ChangeEvent, useRef, useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, Globe, Users, BadgeCheck, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSession } from "@/hooks/use-app-session";
import { Avatar } from "@/components/ui/avatar";
import type { FeedPost } from "@/components/feed/types";

type CreatePostProps = {
  onCreated: (post: FeedPost) => void;
};

export function CreatePost({ onCreated }: CreatePostProps) {
  const { user, token, isAuthenticated } = useAppSession();
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<"campus" | "class" | "public">("campus");
  const [showAudience, setShowAudience] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function clearSelectedFile() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setSelectedFile(null);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatus("Choose a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus("Choose an image smaller than 5MB.");
      return;
    }

    clearSelectedFile();
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus("");
  }

  async function handleSubmit() {
    if (!isAuthenticated || !token || !user) {
      setStatus("Please log in to create a post.");
      return;
    }

    if (!content.trim() && !selectedFile) {
      setStatus("Add some text or an image before posting.");
      return;
    }

    setIsSubmitting(true);
    setStatus("");

    try {
      let imageUrl = "";

      if (selectedFile) {
        const mediaPayload = new FormData();
        mediaPayload.append("file", selectedFile);
        mediaPayload.append("kind", "post");

        const uploadResponse = await fetch("/api/media/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: mediaPayload,
        });
        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData.ok || !uploadData.asset?.url) {
          setStatus(uploadData.error || "Unable to upload the post image.");
          setIsSubmitting(false);
          return;
        }

        imageUrl = uploadData.asset.url;
      }

      const response = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          images: imageUrl ? [imageUrl] : [],
          audience,
          isAnonymous: false,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok || !data.post) {
        setStatus(data.error || "Unable to create your post right now.");
        setIsSubmitting(false);
        return;
      }

      onCreated(data.post);
      setContent("");
      clearSelectedFile();
      setStatus("Post shared successfully.");
    } catch {
      setStatus("Unable to create your post right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-[var(--border-color)] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
      <div className="flex gap-3 px-4 py-4 md:px-5">
        <Avatar alt={user?.name || "User"} src={user?.avatarUrl} className="h-11 w-11" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What's happening on campus?"
            className="min-h-[72px] w-full resize-none bg-transparent text-sm leading-6 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            rows={4}
          />

          {previewUrl ? (
            <div className="relative mt-3 inline-flex">
              <div className="overflow-hidden rounded-2xl bg-[var(--bg-secondary)]">
                <Image src={previewUrl} alt="Selected upload" className="h-32 w-32 object-cover" width={128} height={128} />
              </div>
              <button className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70" onClick={clearSelectedFile} type="button">
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          ) : null}

          {status ? (
            <div className="mt-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {status}
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border-color)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-color)] px-3 text-[var(--text-secondary)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]" onClick={() => fileInputRef.current?.click()} type="button">
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Photo</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowAudience((value) => !value)}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-color)] px-3 text-sm transition-colors",
                    "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                  )}
                  type="button"
                >
                  {audience === "campus" ? <Globe className="h-4 w-4" /> : null}
                  {audience === "class" ? <Users className="h-4 w-4" /> : null}
                  {audience === "public" ? <BadgeCheck className="h-4 w-4" /> : null}
                  <span>{audience === "campus" ? "Campus" : audience === "class" ? "Class" : "Public"}</span>
                </button>

                {showAudience ? (
                  <div className="absolute left-0 top-full z-10 mt-2 w-40 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                    <button onClick={() => { setAudience("campus"); setShowAudience(false); }} className="flex w-full items-center gap-2 px-3 py-3 text-sm hover:bg-[var(--bg-secondary)]" type="button">
                      <Globe className="h-4 w-4" />
                      Campus
                    </button>
                    <button onClick={() => { setAudience("class"); setShowAudience(false); }} className="flex w-full items-center gap-2 px-3 py-3 text-sm hover:bg-[var(--bg-secondary)]" type="button">
                      <Users className="h-4 w-4" />
                      Class
                    </button>
                    <button onClick={() => { setAudience("public"); setShowAudience(false); }} className="flex w-full items-center gap-2 px-3 py-3 text-sm hover:bg-[var(--bg-secondary)]" type="button">
                      <BadgeCheck className="h-4 w-4" />
                      Public
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <button
              disabled={isSubmitting || (!content.trim() && !selectedFile)}
              className={cn(
                "min-w-[110px] justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition",
                isSubmitting || content.trim() || selectedFile
                  ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                  : "border border-[var(--border-color)] bg-white text-[var(--text-muted)]"
              )}
              onClick={handleSubmit}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </button>
          </div>

          <input ref={fileInputRef} accept="image/jpeg,image/png,image/webp" className="hidden" type="file" onChange={handleFileChange} />
        </div>
      </div>
    </div>
  );
}
