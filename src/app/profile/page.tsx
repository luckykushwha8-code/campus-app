"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSession } from "@/hooks/use-app-session";
import { buildUsername, normalizeUser } from "@/lib/app-session";
import { MapPin, GraduationCap, BadgeCheck, Settings, Edit3, CalendarDays, Image as ImageIcon, Heart, Sparkles, LogOut } from "lucide-react";

type ProfileForm = {
  name: string;
  bio: string;
  collegeName: string;
  collegeId: string;
  avatarUrl: string;
  coverUrl: string;
};

type FeedPost = {
  _id?: string;
  id?: string;
  content?: string;
  images?: string[];
  likesCount?: number;
  commentsCount?: number;
  createdAt?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser, logout } = useAppSession();
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    bio: "",
    collegeName: "",
    collegeId: "",
    avatarUrl: "",
    coverUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        collegeName: user.collegeName || "",
        collegeId: user.collegeId || "",
        avatarUrl: user.avatarUrl || "",
        coverUrl: user.coverUrl || "",
      });
    }
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

  const mediaPosts = useMemo(() => posts.filter((post) => (post.images?.length || 0) > 0), [posts]);
  const totalLikes = useMemo(() => posts.reduce((sum, post) => sum + (post.likesCount || 0), 0), [posts]);
  const actionButtonClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0";

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const updates = {
      name: form.name.trim(),
      bio: form.bio.trim(),
      collegeName: form.collegeName.trim(),
      collegeId: form.collegeId.trim(),
      avatarUrl: form.avatarUrl.trim(),
      coverUrl: form.coverUrl.trim(),
      username: buildUsername(user.email, form.name.trim()),
    };

    setIsSaving(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          updates,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setStatusMessage(data.error || "Unable to save profile right now.");
        return;
      }

      updateUser(normalizeUser({ ...user, ...updates }));
      setIsEditing(false);
      setStatusMessage("Profile updated successfully.");
    } catch {
      updateUser(normalizeUser({ ...user, ...updates }));
      setIsEditing(false);
      setStatusMessage("Saved locally. Server update can sync later.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
    router.refresh();
  }

  async function persistProfileMedia(updates: Partial<ProfileForm>, successMessage: string) {
    if (!user) return;

    const nextUser = {
      ...user,
      ...updates,
      username: buildUsername(user.email, form.name.trim() || user.name),
    };

    updateUser(nextUser);
    setForm((current) => ({ ...current, ...updates }));
    setStatusMessage("Saving image...");

    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          updates: nextUser,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setStatusMessage(data.error || "Unable to upload image right now.");
        return;
      }

      updateUser(normalizeUser({ ...nextUser, ...data.user }));
      setStatusMessage(successMessage);
    } catch {
      setStatusMessage(`${successMessage} Saved on this device and will sync when the server is ready.`);
    }
  }

  function readImageFile(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function handleImageSelection(event: ChangeEvent<HTMLInputElement>, target: "avatarUrl" | "coverUrl") {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatusMessage("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage("Please choose an image smaller than 2MB.");
      return;
    }

    try {
      const imageData = await readImageFile(file);
      await persistProfileMedia(
        { [target]: imageData } as Partial<ProfileForm>,
        target === "avatarUrl" ? "Profile photo updated." : "Cover photo updated."
      );
    } catch {
      setStatusMessage("Unable to upload image right now.");
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-[var(--border-color)] bg-white p-8 text-center shadow-[0_18px_60px_rgba(17,24,39,0.07)]">
          <p className="text-sm font-medium text-[var(--accent)]">Profile locked</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">Sign in to set up your profile</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Login unlocks your profile details, room memberships, event registrations, and saved campus activity.
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
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="overflow-hidden rounded-[32px] border border-[var(--border-color)] bg-white shadow-[0_18px_60px_rgba(17,24,39,0.07)]">
          <div
            className="relative min-h-[188px] rounded-b-[28px] bg-[linear-gradient(135deg,#1d4ed8_0%,#0f172a_45%,#0ea5e9_100%)] bg-cover bg-center"
            style={form.coverUrl ? { backgroundImage: `linear-gradient(135deg, rgba(29,78,216,0.22) 0%, rgba(15,23,42,0.38) 50%, rgba(14,165,233,0.18) 100%), url(${form.coverUrl})` } : undefined}
          >
            <div className="absolute inset-x-0 bottom-0 flex justify-end p-4 sm:p-5">
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/92 text-[var(--text-primary)] shadow-[0_10px_24px_rgba(15,23,42,0.14)] backdrop-blur transition hover:bg-white"
                onClick={() => coverInputRef.current?.click()}
                type="button"
                aria-label="Edit cover photo"
                title="Edit cover photo"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative px-5 pb-6 pt-0 sm:px-6 sm:pb-8">
            <div className="relative z-10 -mt-12 flex flex-col gap-6 sm:-mt-14 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
                <div className="relative w-fit">
                  <Avatar
                    alt={user.name}
                    src={form.avatarUrl}
                    className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] sm:h-28 sm:w-28"
                  />
                  <button
                    className="absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--text-primary)] text-white shadow-[0_8px_20px_rgba(15,23,42,0.22)] transition hover:bg-[var(--accent)]"
                    onClick={() => avatarInputRef.current?.click()}
                    type="button"
                    aria-label="Edit profile photo"
                    title="Edit profile photo"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
                <div className="min-w-0 space-y-1 pt-2 sm:pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl">{user.name}</h1>
                    {user.verified ? <BadgeCheck className="h-5 w-5 text-[var(--accent)]" /> : null}
                  </div>
                  <p className="text-base font-medium text-[var(--text-muted)]">@{user.username}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                  <p className="pt-1 text-xs text-[var(--text-muted)]">Avatar: 512 x 512 px recommended. Cover: 1500 x 500 px recommended.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end lg:pt-3">
                <button
                  className={`${actionButtonClass} border-[var(--border-light)] bg-white text-[var(--accent)] shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:bg-[var(--bg-secondary)]`}
                  onClick={() => setIsEditing((value) => !value)}
                  type="button"
                >
                  <Edit3 className="h-4 w-4" />
                  {isEditing ? "Close Edit" : "Edit Profile"}
                </button>
                <button
                  className={`${actionButtonClass} border-transparent bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-color)] hover:bg-white hover:text-[var(--text-primary)]`}
                  onClick={() => router.push("/settings")}
                  type="button"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button
                  className={`${actionButtonClass} border-transparent bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-color)] hover:bg-white hover:text-[var(--text-primary)]`}
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
                <ProfileStat label="Posts" value={posts.length} />
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
              <form className="mt-6 grid gap-4 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]" onSubmit={handleSave}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Name</label>
                    <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Avatar URL</label>
                    <Input value={form.avatarUrl} onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Cover URL</label>
                    <Input value={form.coverUrl} onChange={(event) => setForm((current) => ({ ...current, coverUrl: event.target.value }))} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">College</label>
                    <Input value={form.collegeName} onChange={(event) => setForm((current) => ({ ...current, collegeName: event.target.value }))} />
                  </div>
                  <div className="sm:col-start-2">
                    <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">College ID</label>
                    <Input value={form.collegeId} onChange={(event) => setForm((current) => ({ ...current, collegeId: event.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Bio</label>
                  <textarea
                    className="input-clean min-h-[120px] w-full resize-none"
                    value={form.bio}
                    onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                    placeholder="Tell your campus who you are."
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
                  <TabsTrigger value="likes">Likes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoCard
                      icon={Sparkles}
                      title="Profile strength"
                      body={user.bio && user.collegeName && user.collegeId ? "Your profile looks complete and ready for real campus use." : "Add your bio, college name, and campus ID to complete your profile."}
                    />
                    <InfoCard
                      icon={Settings}
                      title="Quick actions"
                      body="Open settings to control privacy, notifications, and account preferences."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="posts">
                  <PostList posts={posts} loading={postsLoading} emptyMessage="Your posts will appear here once you share something on campus." />
                </TabsContent>

                <TabsContent value="media">
                  <PostList posts={mediaPosts} loading={postsLoading} emptyMessage="Posts with images will show up here." />
                </TabsContent>

                <TabsContent value="likes">
                  <div className="grid gap-4 md:grid-cols-3">
                    <ProfileStatCard icon={Heart} label="Total post likes" value={totalLikes} />
                    <ProfileStatCard icon={ImageIcon} label="Media posts" value={mediaPosts.length} />
                    <ProfileStatCard icon={CalendarDays} label="Published posts" value={posts.length} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <input ref={avatarInputRef} accept="image/*" className="hidden" type="file" onChange={(event) => handleImageSelection(event, "avatarUrl")} />
          <input ref={coverInputRef} accept="image/*" className="hidden" type="file" onChange={(event) => handleImageSelection(event, "coverUrl")} />
        </div>
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

function InfoCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Sparkles;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white p-3 text-[var(--accent)]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{body}</p>
        </div>
      </div>
    </div>
  );
}

function ProfileStatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Heart;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white p-3 text-[var(--accent)]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
          <p className="text-sm text-[var(--text-secondary)]">{label}</p>
        </div>
      </div>
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
