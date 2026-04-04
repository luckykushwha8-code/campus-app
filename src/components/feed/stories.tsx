"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const stories = [
  { id: "1", name: "Your Story", isAdd: true, image: null },
  { id: "2", name: "Rahul", image: "https://picsum.photos/seed/story1/400/600" },
  { id: "3", name: "Priya", image: "https://picsum.photos/seed/story2/400/600" },
  { id: "4", name: "Amit", image: "https://picsum.photos/seed/story3/400/600" },
  { id: "5", name: "Sneha", image: "https://picsum.photos/seed/story4/400/600" },
  { id: "6", name: "Raj", image: "https://picsum.photos/seed/story5/400/600" },
];

export function Stories() {
  const [viewingStory, setViewingStory] = useState<string | null>(null);

  return (
    <>
      <div className="app-surface px-4 py-3">
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-hide">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => !story.isAdd && setViewingStory(story.id)}
              className="flex shrink-0 flex-col items-center gap-2"
              type="button"
            >
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full p-0.5 transition-all",
                  story.isAdd
                    ? "bg-[var(--bg-secondary)]"
                    : "bg-[linear-gradient(135deg,#2563eb_0%,#7c3aed_100%)]"
                )}
              >
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                  {story.isAdd ? (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--bg-secondary)] text-xl text-[var(--text-muted)]">+</div>
                  ) : (
                    <Image src={story.image || ""} alt={story.name} className="h-full w-full object-cover" width={56} height={56} />
                  )}
                </div>
              </div>
              <span className="max-w-[64px] truncate text-caption text-[var(--text-secondary)]">{story.isAdd ? "Add" : story.name}</span>
            </button>
          ))}
        </div>
      </div>

      {viewingStory ? (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={() => setViewingStory(null)}>
          <div className="absolute inset-x-0 top-4 z-10 px-4">
            <div className="mx-auto flex max-w-md gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full bg-white/70" style={{ width: i === 1 ? "100%" : "0%" }} />
                </div>
              ))}
            </div>
          </div>

          <div className="absolute inset-x-0 top-10 z-10 mx-auto flex max-w-md items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full">
                <Image
                  src={stories.find((story) => story.id === viewingStory)?.image || ""}
                  alt=""
                  className="h-full w-full object-cover"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-white">{stories.find((story) => story.id === viewingStory)?.name}</span>
                <span className="text-xs text-white/70">2h ago</span>
              </div>
            </div>
            <button className="text-2xl font-light text-white/80" onClick={() => setViewingStory(null)} type="button">
              x
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
