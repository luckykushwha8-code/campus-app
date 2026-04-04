"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, Smile, Globe, Users, BadgeCheck, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export function CreatePost() {
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<"campus" | "class" | "anonymous">("campus");
  const [showAudience, setShowAudience] = useState(false);
  const [showMedia, setShowMedia] = useState(false);

  return (
    <div className="app-surface p-4 md:p-5">
      <div className="flex gap-3">
        <div className="h-11 w-11 overflow-hidden rounded-full">
          <Image
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=rahul"
            alt="User"
            className="h-full w-full object-cover"
            width={44}
            height={44}
          />
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Share something useful with your campus"
            className="min-h-[68px] w-full resize-none bg-transparent text-sm leading-6 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            rows={3}
          />

          {showMedia ? (
            <div className="relative mt-3 inline-flex">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-[var(--bg-secondary)]">
                <Camera className="h-5 w-5 text-[var(--text-muted)]" />
              </div>
              <button className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70" type="button">
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border-color)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button className="app-panel rounded-xl px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" type="button">
                <ImageIcon className="h-4 w-4" />
              </button>
              <button className="app-panel rounded-xl px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" type="button">
                <Smile className="h-4 w-4" />
              </button>
              <button className="app-panel rounded-xl px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" onClick={() => setShowMedia((value) => !value)} type="button">
                <Camera className="h-4 w-4" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowAudience((value) => !value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                    audience === "anonymous"
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "app-panel text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                  type="button"
                >
                  {audience === "campus" ? <Globe className="h-4 w-4" /> : null}
                  {audience === "class" ? <Users className="h-4 w-4" /> : null}
                  {audience === "anonymous" ? <BadgeCheck className="h-4 w-4" /> : null}
                  <span>
                    {audience === "campus" ? "Campus" : audience === "class" ? "Class" : "Anonymous"}
                  </span>
                </button>

                {showAudience ? (
                  <div className="app-surface absolute left-0 top-full z-10 mt-2 w-40 overflow-hidden">
                    <button onClick={() => { setAudience("campus"); setShowAudience(false); }} className="flex w-full items-center gap-2 px-3 py-3 text-sm hover:bg-[var(--bg-secondary)]" type="button">
                      <Globe className="h-4 w-4" />
                      Campus
                    </button>
                    <button onClick={() => { setAudience("class"); setShowAudience(false); }} className="flex w-full items-center gap-2 px-3 py-3 text-sm hover:bg-[var(--bg-secondary)]" type="button">
                      <Users className="h-4 w-4" />
                      Class
                    </button>
                    <button onClick={() => { setAudience("anonymous"); setShowAudience(false); }} className="flex w-full items-center gap-2 px-3 py-3 text-sm hover:bg-[var(--bg-secondary)]" type="button">
                      <BadgeCheck className="h-4 w-4" />
                      Anonymous
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <button
              disabled={!content.trim()}
              className={cn("min-w-[104px]", content.trim() ? "button-clean" : "button-outline")}
              type="button"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
