"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaEditorDialog } from "@/components/profile/media-editor-dialog";
import { useAppSession } from "@/hooks/use-app-session";
import { processProfileImage, type ProfileMediaTarget } from "@/lib/client-image";
import { buildUsername, normalizeUser } from "@/lib/app-session";
import { BadgeCheck, CalendarDays, Camera, Edit3, GraduationCap, Image as ImageIcon, LogOut, MapPin, Settings, Trash2 } from "lucide-react";

type ProfileForm = {
  name: string;
  username: string;
  bio: string;
  collegeName: string;
  collegeId: string;
};

type FeedPost = {
  _id?: string;
  id?: string;
  content?: string;
  images?: string[];
  likesCount?: number;
  commentsCount?: number;
};

type MediaDraft = {
  target: ProfileMediaTarget;
  file: File | null;
  previewUrl: string;
  error: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, updateUser, logout } = useAppSession();
  const [isHydrated, setIsHydrated] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    username: "",
    bio: "",
    collegeName: "",
    collegeId: "",
  });
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [mediaDraft, setMediaDraft] = useState<MediaDraft | null>(null);
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [mediaBusyTarget, setMediaBusyTarget] = useState<ProfileMediaTarget | null>(null);

  const avatarGalleryInputRef = useRef<HTMLInputElement>(null);
  const avatarCameraInputRef = useRef<HTMLInputElement>(null);
  const coverGalleryInputRef = useRef<HTMLInputElement>(null);
  const coverCameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      name: user.name || "",
      username: user.username || buildUsername(user.email, user.name),
      bio: user.bio || "",
      collegeName: user.collegeName || "",
      collegeId: user.collegeId || "",
    });
  }, [user]);

  useEffect(() => {
    async function loadPosts() {
      if (!user?.id) return;
      setPostsLoading(true);
      try {
        const response = await fetch(`/api/posts/feed?authorId=${user.id}&limit=25`, { cache: "no-store" });
        const data = await response.json();
        if (response.ok && data.ok) {
          setPosts(data.posts || []);
        }
      } finally {
        setPostsLoading(false);
      }
    }

    loadPosts();
  }, [user?.id]);

  useEffect(() => {
    return () => {
      if (mediaDraft?.previewUrl) {
        URL.revokeObjectURL(mediaDraft.previewUrl);
      }
    };
  }, [mediaDraft]);

  const mediaPosts = useMemo(() => posts.filter((post) => (post.images?.length || 0) > 0), [posts]);
  const totalLikes = useMemo(() => posts.reduce((sum, post) => sum + (post.likesCount || 0), 0), [posts]);
  const postsCount = posts.length;

  function resetMediaDraft() {
    if (mediaDraft?.previewUrl) {
      URL.revokeObjectURL(mediaDraft.previewUrl);
    }
    setMediaDraft(null);
  }

  function openMediaDialog(target: ProfileMediaTarget) {
    if (!user) return;
    const previewUrl = target === "avatar" ? user.avatarUrl || "" : user.coverUrl || "";
    setMediaDraft({
      target,
      file: null,
      previewUrl,
      error: "",
    });
  }

  async function handleMediaFile(event: ChangeEvent<HTMLInputElement>, target: ProfileMediaTarget) {
    const file = event.target.files?.[0] || null;
    event.target.value = "";

    if (!file) {
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMediaDraft((current) => current ? { ...current, error: "Use JPG, PNG, or WEBP images only." } : current);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setMediaDraft((current) => current ? { ...current, error: "Please choose an image smaller than 8MB." } : current);
      return;
    }

    try {
      const processed = await processProfileImage(file, { target });
      if (mediaDraft?.previewUrl) {
        URL.revokeObjectURL(mediaDraft.previewUrl);
      }
      setMediaDraft({
        target,
        file: processed.file,
        previewUrl: processed.previewUrl,
        error: "",
      });
    } catch {
      setMediaDraft((current) => current ? { ...current, error: "Unable to prepare this image. Try another one." } : current);
    }
  }

  async function saveMediaDraft() {
    if (!mediaDraft?.file || !token || !user) {
      setMediaDraft((current) => current ? { ...current, error: "Choose an image before saving." } : current);
      return;
    }

    setIsSavingMedia(true);
    setStatusMessage("");
    setMediaDraft((current) => current ? { ...current, error: "" } : current);

    try {
      const payload = new FormData();
      payload.append("file", mediaDraft.file);
      payload.append("kind", mediaDraft.target === "avatar" ? "avatar" : "cover");

      const uploadResponse = await fetch("/api/media/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });
      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.ok || !uploadData.asset?.url || !uploadData.asset?.publicId) {
        setMediaDraft((current) => current ? { ...current, error: uploadData.error || "Unable to upload this image right now." } : current);
        return;
      }

      const updateResponse = await fetch("/api/user/media", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target: mediaDraft.target,
          action: "set",
          url: uploadData.asset.url,
          publicId: uploadData.asset.publicId,
        }),
      });
      const updateData = await updateResponse.json();

      if (!updateResponse.ok || !updateData.ok || !updateData.user) {
        setMediaDraft((current) => current ? { ...current, error: updateData.error || "Unable to save this image right now." } : current);
        return;
      }

      updateUser(normalizeUser(updateData.user));
      resetMediaDraft();
      setStatusMessage(mediaDraft.target === "avatar" ? "Profile photo updated." : "Header photo updated.");
    } catch {
      setMediaDraft((current) => current ? { ...current, error: "Upload failed. Check your connection and try again." } : current);
    } finally {
      setIsSavingMedia(false);
    }
  }

  async function removeMedia(target: ProfileMediaTarget) {
    if (!token || !user) return;
    setMediaBusyTarget(target);
    setStatusMessage("");
    try {
      const response = await fetch("/api/user/media", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target,
          action: "remove",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok || !data.user) {
        setStatusMessage(data.error || "Unable to remove this image right now.");
        return;
      }

      updateUser(normalizeUser(data.user));
      if (mediaDraft?.target === target) {
        resetMediaDraft();
      }
      setStatusMessage(target === "avatar" ? "Profile photo removed." : "Header photo removed.");
    } catch {
      setStatusMessage("Unable to remove this image right now.");
    } finally {
      setMediaBusyTarget(null);
    }
  }

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !token) return;

    const updates = {
      name: form.name.trim(),
      username: form.username.trim().toLowerCase(),
      bio: form.bio.trim(),
      collegeName: form.collegeName.trim(),
      collegeId: form.collegeId.trim(),
    };

    setIsSaving(true);
    setStatusMessage("");
    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          updates,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok || !data.user) {
        setStatusMessage(data.error || "Unable to save profile right now.");
        return;
      }

      updateUser(normalizeUser(data.user));
      setIsEditing(false);
      setStatusMessage("Profile updated successfully.");
    } catch {
      setStatusMessage("Unable to save profile right now.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
    router.refresh();
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-[var(--border-color)] bg-white shadow-[0_18px_60px_rgba(17,24,39,0.07)]">
          <div className="h-[220px] animate-pulse bg-[var(--bg-secondary)]" />
          <div className="px-6 pb-8">
            <div className="-mt-12 flex items-end gap-4">
              <div className="h-24 w-24 animate-pulse rounded-full border-4 border-white bg-[var(--bg-secondary)]" />
              <div className="space-y-3 pt-8">
                <div className="h-7 w-52 animate-pulse rounded bg-[var(--bg-secondary)]" />
                <div className="h-4 w-36 animate-pulse rounded bg-[var(--bg-secondary)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-[var(--border-color)] bg-white p-8 text-center shadow-[0_18px_60px_rgba(17,24,39,0.07)]">
          <p className="text-sm font-medium text-[var(--accent)]">Profile locked</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">Sign in to manage your profile</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Login unlocks your profile details, profile media, room memberships, and campus activity.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link className="button-clean" href="/login">
              Login
            </Link>
            <Link className="button-outline" href="/signup">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="overflow-hidden rounded-[32px] border border-[var(--border-color)] bg-white shadow-[0_18px_60px_rgba(17,24,39,0.07)]">
            <div
              className="relative min-h-[220px] rounded-b-[28px] bg-[linear-gradient(135deg,#1d4ed8_0%,#0f172a_45%,#0ea5e9_100%)] bg-cover bg-center"
              style={user.coverUrl ? { backgroundImage: `linear-gradient(135deg, rgba(29,78,216,0.24) 0%, rgba(15,23,42,0.4) 52%, rgba(14,165,233,0.18) 100%), url(${user.coverUrl})` } : undefined}
            >
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 p-4 sm:p-5">
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/92 text-[var(--text-primary)] shadow-[0_10px_24px_rgba(15,23,42,0.14)] backdrop-blur transition hover:bg-white"
                  onClick={() => openMediaDialog("cover")}
                  type="button"
                  aria-label="Edit cover photo"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
                {user.coverUrl ? (
                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/92 text-red-600 shadow-[0_10px_24px_rgba(15,23,42,0.14)] backdrop-blur transition hover:bg-white disabled:opacity-60"
                    disabled={mediaBusyTarget === "cover"}
                    onClick={() => removeMedia("cover")}
                    type="button"
                    aria-label="Remove cover photo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="relative px-5 pb-6 pt-0 sm:px-6 sm:pb-8">
              <div className="relative z-10 -mt-8 flex flex-col gap-6 sm:-mt-10 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
                  <div className="relative w-fit">
                    <Avatar
                      alt={user.name}
                      className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] sm:h-28 sm:w-28"
                      src={user.avatarUrl}
                    />
                    <div className="absolute bottom-0 right-0 flex gap-2">
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--text-primary)] text-white shadow-[0_8px_20px_rgba(15,23,42,0.22)] transition hover:bg-[var(--accent)]"
                        onClick={() => openMediaDialog("avatar")}
                        type="button"
                        aria-label="Edit profile photo"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                      {user.avatarUrl ? (
                        <button
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-red-600 shadow-[0_8px_20px_rgba(15,23,42,0.18)] transition hover:bg-red-50 disabled:opacity-60"
                          disabled={mediaBusyTarget === "avatar"}
                          onClick={() => removeMedia("avatar")}
                          type="button"
                          aria-label="Remove profile photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="min-w-0 space-y-1 pt-6 sm:pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl">{user.name}</h1>
                      {user.verified ? <BadgeCheck className="h-5 w-5 text-[var(--accent)]" /> : null}
                    </div>
                    <p className="text-base font-medium text-[var(--text-muted)]">@{user.username}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                    <p className="pt-1 text-xs text-[var(--text-muted)]">Profile photo is square-cropped. Cover photo uses a 3:1 crop and saves after refresh.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end lg:pt-6">
                  <button
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--border-light)] bg-white px-4 py-3 text-sm font-semibold text-[var(--accent)] shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--bg-secondary)] active:translate-y-0"
                    onClick={() => setIsEditing((value) => !value)}
                    type="button"
                  >
                    <Edit3 className="h-4 w-4" />
                    {isEditing ? "Close editor" : "Edit Profile"}
                  </button>
                  <button
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-transparent bg-[var(--bg-secondary)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-color)] hover:bg-white hover:text-[var(--text-primary)] active:translate-y-0"
                    onClick={() => router.push("/settings")}
                    type="button"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-transparent bg-[var(--bg-secondary)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-color)] hover:bg-white hover:text-[var(--text-primary)] active:translate-y-0"
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-[2fr_1fr]">
                <div>
                  <p className="text-base leading-7 text-[var(--text-secondary)]">
                    {user.bio || "Add a short intro so your classmates know what you build, study, or care about."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-secondary)] px-3 py-2">
                      <GraduationCap className="h-4 w-4" />
                      {user.collegeName || "Add your college"}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-secondary)] px-3 py-2">
                      <MapPin className="h-4 w-4" />
                      {user.collegeId || "Add your campus ID"}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-secondary)] px-3 py-2">
                      <CalendarDays className="h-4 w-4" />
                      Member profile
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 self-start">
                  <ProfileStat label="Posts" value={postsCount} />
                  <ProfileStat label="Media" value={mediaPosts.length} />
                  <ProfileStat label="Likes" value={totalLikes} />
                </div>
              </div>

              {statusMessage ? (
                <div className="mt-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                  {statusMessage}
                </div>
              ) : null}

              {isEditing ? (
                <form className="mt-6 grid gap-4 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]" onSubmit={handleSaveProfile}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Name</label>
                      <Input maxLength={60} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Username</label>
                      <Input maxLength={24} value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value.toLowerCase() }))} />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">College</label>
                      <Input value={form.collegeName} onChange={(event) => setForm((current) => ({ ...current, collegeName: event.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">College ID</label>
                      <Input value={form.collegeId} onChange={(event) => setForm((current) => ({ ...current, collegeId: event.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Bio</label>
                    <textarea
                      className="input-clean min-h-[120px] w-full resize-none"
                      maxLength={240}
                      value={form.bio}
                      onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                      placeholder="Tell your campus who you are."
                    />
                    <p className="mt-2 text-xs text-[var(--text-muted)]">{form.bio.length}/240</p>
                  </div>

                  <div className="grid gap-3 rounded-2xl border border-[var(--border-color)] bg-white p-4 sm:grid-cols-2">
                    <MediaQuickCard
                      hasImage={Boolean(user.avatarUrl)}
                      label="Profile photo"
                      onChange={() => openMediaDialog("avatar")}
                      onRemove={user.avatarUrl ? () => removeMedia("avatar") : undefined}
                    />
                    <MediaQuickCard
                      hasImage={Boolean(user.coverUrl)}
                      label="Header image"
                      onChange={() => openMediaDialog("cover")}
                      onRemove={user.coverUrl ? () => removeMedia("cover") : undefined}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button className="button-clean" disabled={isSaving} type="submit">
                      {isSaving ? "Saving..." : "Save changes"}
                    </button>
                    <button className="button-outline" onClick={() => setIsEditing(false)} type="button">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}

              <div className="mt-6">
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4 grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="public">Public View</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <div className="grid gap-4 md:grid-cols-2">
                      <InfoCard title="Profile media" body="Your avatar and header save to cloud storage, survive refreshes, and show up anywhere your profile appears." />
                      <InfoCard title="Public profile" body="Other users can view your media and profile details on your public profile page." />
                    </div>
                  </TabsContent>

                  <TabsContent value="posts">
                    <PostList posts={posts} loading={postsLoading} emptyMessage="Your posts will appear here once you share something on campus." />
                  </TabsContent>

                  <TabsContent value="media">
                    <PostList posts={mediaPosts} loading={postsLoading} emptyMessage="Posts with images will show up here." />
                  </TabsContent>

                  <TabsContent value="public">
                    <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
                      <p className="text-sm leading-6 text-[var(--text-secondary)]">
                        This is the profile other users can open to see your current photo and header.
                      </p>
                      <div className="mt-4">
                        <Link className="button-clean" href={`/profile/${user.id}`}>
                          Open public profile
                        </Link>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      <input ref={avatarGalleryInputRef} accept="image/jpeg,image/png,image/webp" className="hidden" type="file" onChange={(event) => handleMediaFile(event, "avatar")} />
      <input ref={avatarCameraInputRef} accept="image/jpeg,image/png,image/webp" capture="user" className="hidden" type="file" onChange={(event) => handleMediaFile(event, "avatar")} />
      <input ref={coverGalleryInputRef} accept="image/jpeg,image/png,image/webp" className="hidden" type="file" onChange={(event) => handleMediaFile(event, "cover")} />
      <input ref={coverCameraInputRef} accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" type="file" onChange={(event) => handleMediaFile(event, "cover")} />

      <MediaEditorDialog
        canRemove={Boolean(mediaDraft && user && (mediaDraft.target === "avatar" ? user.avatarUrl : user.coverUrl))}
        canSave={Boolean(mediaDraft?.file)}
        error={mediaDraft?.error || ""}
        isOpen={Boolean(mediaDraft)}
        isSaving={isSavingMedia}
        previewUrl={mediaDraft?.previewUrl || ""}
        target={mediaDraft?.target || "avatar"}
        onClose={resetMediaDraft}
        onPickCamera={() => (mediaDraft?.target === "avatar" ? avatarCameraInputRef.current?.click() : coverCameraInputRef.current?.click())}
        onPickGallery={() => (mediaDraft?.target === "avatar" ? avatarGalleryInputRef.current?.click() : coverGalleryInputRef.current?.click())}
        onRemove={() => mediaDraft ? removeMedia(mediaDraft.target) : undefined}
        onSave={saveMediaDraft}
      />
    </>
  );
}

function MediaQuickCard({
  label,
  hasImage,
  onChange,
  onRemove,
}: {
  label: string;
  hasImage: boolean;
  onChange: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
      <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{hasImage ? "Saved and visible across the app." : "Using a clean fallback placeholder right now."}</p>
      <div className="mt-3 flex gap-2">
        <button className="button-outline" onClick={onChange} type="button">
          {hasImage ? "Change" : "Upload"}
        </button>
        {onRemove ? (
          <button className="button-outline text-red-600 hover:border-red-200 hover:bg-red-50" onClick={onRemove} type="button">
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[var(--bg-secondary)] px-4 py-4 text-center">
      <p className="text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{body}</p>
    </div>
  );
}

function PostList({
  posts,
  loading,
  emptyMessage,
}: {
  posts: FeedPost[];
  loading: boolean;
  emptyMessage: string;
}) {
  if (loading) {
    return <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-8 text-sm text-[var(--text-secondary)]">Loading profile activity...</div>;
  }

  if (!posts.length) {
    return <div className="rounded-3xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-8 text-sm text-[var(--text-secondary)]">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post._id || post.id} className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-primary)]">{post.content || "Campus update"}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
            <span>{post.likesCount || 0} likes</span>
            <span>{post.commentsCount || 0} comments</span>
            <span>{post.images?.length || 0} media</span>
          </div>
        </div>
      ))}
    </div>
  );
}
