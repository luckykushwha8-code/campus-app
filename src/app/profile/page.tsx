"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSession } from "@/hooks/use-app-session";
import { buildUsername, normalizeUser } from "@/lib/app-session";
import {
  MapPin,
  GraduationCap,
  BadgeCheck,
  Settings,
  Edit3,
  LogOut,
  CalendarDays,
  Image as ImageIcon,
  Heart,
  Sparkles,
} from "lucide-react";

type ProfileForm = {
  name: string;
  bio: string;
  collegeName: string;
  collegeId: string;
  avatarUrl: string;
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
  const { user, isAuthenticated, logout, updateUser } = useAppSession();
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    bio: "",
    collegeName: "",
    collegeId: "",
    avatarUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        collegeName: user.collegeName || "",
        collegeId: user.collegeId || "",
        avatarUrl: user.avatarUrl || "",
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

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const updates = {
      name: form.name.trim(),
      bio: form.bio.trim(),
      collegeName: form.collegeName.trim(),
      collegeId: form.collegeId.trim(),
      avatarUrl: form.avatarUrl.trim(),
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
          <div className="h-44 bg-[linear-gradient(135deg,#1d4ed8_0%,#0f172a_45%,#0ea5e9_100%)]" />

          <div className="px-6 pb-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="-mt-12 flex items-end gap-4">
                <Avatar alt={user.name} src={user.avatarUrl} className="h-28 w-28 border-4 border-white shadow-lg" />
                <div className="pb-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-semibold text-[var(--text-primary)]">{user.name}</h1>
                    {user.verified ? <BadgeCheck className="h-5 w-5 text-[var(--accent)]" /> : null}
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">@{user.username}</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="button-outline flex items-center gap-2" onClick={() => setIsEditing((value) => !value)} type="button">
                  <Edit3 className="h-4 w-4" />
                  {isEditing ? "Close Edit" : "Edit Profile"}
                </button>
                <button className="button-ghost flex items-center gap-2" onClick={() => router.push("/settings")} type="button">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button className="button-ghost flex items-center gap-2" onClick={handleLogout} type="button">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr]">
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

              <div className="grid grid-cols-3 gap-3">
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
              <form className="mt-6 grid gap-4 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5" onSubmit={handleSave}>
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
