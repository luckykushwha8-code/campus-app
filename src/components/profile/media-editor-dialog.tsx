"use client";

import Image from "next/image";
import { Camera, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import type { ProfileMediaTarget } from "@/lib/client-image";

type MediaEditorDialogProps = {
  isOpen: boolean;
  target: ProfileMediaTarget;
  previewUrl: string;
  canSave: boolean;
  isSaving: boolean;
  canRemove: boolean;
  error: string;
  onClose: () => void;
  onPickGallery: () => void;
  onPickCamera: () => void;
  onRemove: () => void;
  onSave: () => void;
};

export function MediaEditorDialog({
  isOpen,
  target,
  previewUrl,
  canSave,
  isSaving,
  canRemove,
  error,
  onClose,
  onPickGallery,
  onPickCamera,
  onRemove,
  onSave,
}: MediaEditorDialogProps) {
  if (!isOpen) {
    return null;
  }

  const title = target === "avatar" ? "Profile photo" : "Cover photo";
  const ratioHint = target === "avatar" ? "Square crop, best at 720 x 720 px" : "Cover crop, best at 1500 x 500 px";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-[var(--border-color)] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{ratioHint}</p>
          </div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="overflow-hidden rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            {previewUrl ? (
              <div className={target === "avatar" ? "mx-auto max-w-[320px] p-6" : ""}>
                <div className={target === "avatar" ? "relative aspect-square overflow-hidden rounded-full border-4 border-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]" : "relative aspect-[3/1] w-full"}>
                  <Image
                    alt={`${title} preview`}
                    className="h-full w-full object-cover"
                    fill
                    sizes={target === "avatar" ? "320px" : "(max-width: 768px) 100vw, 900px"}
                    src={previewUrl}
                  />
                </div>
              </div>
            ) : (
              <div className="flex min-h-[240px] items-center justify-center px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
                Choose an image to preview it before saving.
              </div>
            )}
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {error}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button className="button-outline gap-2" onClick={onPickGallery} type="button">
              <ImagePlus className="h-4 w-4" />
              Gallery
            </button>
            <button className="button-outline gap-2" onClick={onPickCamera} type="button">
              <Camera className="h-4 w-4" />
              Camera
            </button>
            {canRemove ? (
              <button className="button-outline gap-2 text-red-600 hover:border-red-200 hover:bg-red-50" onClick={onRemove} type="button">
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--border-color)] px-5 py-4">
          <button className="button-outline" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="button-clean gap-2" disabled={!canSave || isSaving} onClick={onSave} type="button">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save image"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
