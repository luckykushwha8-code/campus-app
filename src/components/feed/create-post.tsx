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
    <div className="border-b border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Image
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=rahul"
            alt="User"
            className="w-full h-full object-cover"
            width={40}
            height={40}
          />
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening on campus?"
            className="w-full min-h-[60px] resize-none bg-transparent text-body focus:outline-none placeholder:text-[var(--text-muted)]"
            rows={2}
          />

          {/* Media Preview - Hidden for now */}
          {showMedia && (
            <div className="relative mt-2 inline-flex">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-[var(--bg-secondary)] flex items-center justify-center">
                <Camera className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
              <button className="absolute -top-2 -right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors">
                <ImageIcon className="h-4 w-4" />
              </button>
              <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors">
                <Smile className="h-4 w-4" />
              </button>
              <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors">
                <Camera className="h-4 w-4" />
              </button>

              {/* Audience Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAudience(!showAudience)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                    audience === "anonymous"
                      ? "text-[var(--accent)] bg-[var(--accent)]/10"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  )}
                >
                  {audience === "campus" && <Globe className="h-4 w-4" />}
                  {audience === "class" && <Users className="h-4 w-4" />}
                  {audience === "anonymous" && <BadgeCheck className="h-4 w-4" />}
                  <span className="ml-1 text-body">
                    {audience === "campus" && "Campus"}
                    {audience === "class" && "Class"}
                    {audience === "anonymous" && "Anonymous"}
                  </span>
                </button>

                {showAudience && (
                  <div className="absolute top-full left-0 mt-2 w-36 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md shadow-lg overflow-hidden z-10">
                    <button
                      onClick={() => {
                        setAudience("campus");
                        setShowAudience(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-secondary)]"
                    >
                      <Globe className="h-4 w-4" />
                      Campus
                    </button>
                    <button
                      onClick={() => {
                        setAudience("class");
                        setShowAudience(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-secondary)]"
                    >
                      <Users className="h-4 w-4" />
                      Class
                    </button>
                    <button
                      onClick={() => {
                        setAudience("anonymous");
                        setShowAudience(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-secondary)]"
                    >
                      <BadgeCheck className="h-4 w-4" />
                      Anonymous
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              disabled={!content.trim()}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                content.trim() ? "button-clean" : "button-outline"
              )}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
