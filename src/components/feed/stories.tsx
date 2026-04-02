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
  { id: "7", name: "Anjali", image: "https://picsum.photos/seed/story6/400/600" },
  { id: "8", name: "Vikram", image: "https://picsum.photos/seed/story7/400/600" },
];

export function Stories() {
  const [viewingStory, setViewingStory] = useState<string | null>(null);

  return (
    <>
      {/* Stories Bar - Clean Style */}
      <div className="border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => !story.isAdd && setViewingStory(story.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 tap-highlight"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full p-0.5 transition-all",
                  story.isAdd
                    ? "border-[var(--border-color)] bg-[var(--bg-secondary)]"
                    : "border-[2px] border-[var(--accent)] bg-[var(--bg-secondary)] hover:scale-105 transition-transform"
                )}
              >
                <div className="w-full h-full rounded-full overflow-hidden">
                  {story.isAdd ? (
                    <div className="w-full h-full flex items-center justify-center relative">
                      <div className="w-6 h-6 rounded-full border-[var(--border-color)] flex items-center justify-center">
                        <svg className="w-3 h-3 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={story.image || ""}
                      alt={story.name}
                      className="w-full h-full object-cover"
                      width={48}
                      height={48}
                    />
                  )}
                </div>
              </div>
              <span className="text-caption text-[var(--text-secondary)] truncate max-w-[60px]">
                {story.isAdd ? "Add" : story.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal - Clean Style */}
      {viewingStory && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setViewingStory(null)}>
          <div className="absolute top-4 left-0 right-0 px-4 z-10">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/30 animate-pulse" style={{ width: i === 1 ? "100%" : "0%" }} />
                </div>
              ))}
            </div>
          </div>

          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={stories.find((s) => s.id === viewingStory)?.image || ""}
                  alt=""
                  className="w-full h-full object-cover"
                  width={40}
                  height={40}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-body font-medium text-[var(--text-primary)]">
                  {stories.find((s) => s.id === viewingStory)?.name}
                </span>
                <span className="text-caption text-[var(--text-muted)]">2h</span>
              </div>
            </div>
            <button
              onClick={() => setViewingStory(null)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-2xl font-light"
            >
              x
            </button>
          </div>

          <div className="absolute bottom-8 left-0 right-0 px-4">
            <input
              type="text"
              placeholder="Send message..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] text-body"
            />
          </div>
        </div>
      )}
    </>
  );
}
