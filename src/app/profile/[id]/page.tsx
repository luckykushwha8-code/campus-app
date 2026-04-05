"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { BadgeCheck, GraduationCap, MapPin } from "lucide-react";

type PublicUser = {
  id: string;
  name: string;
  username: string;
  bio?: string;
  collegeName?: string;
  collegeId?: string;
  avatarUrl?: string;
  coverUrl?: string;
  verified?: boolean;
  followers: number;
  following: number;
};

type PublicPost = {
  id: string;
  content: string;
  images?: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
};

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();
  const profileId = String(params?.id || "");
  const [user, setUser] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");

  const loadProfile = useCallback(async () => {
    if (!profileId) {
      setStatus("Profile not found.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setStatus("");
    try {
      const [userResponse, postsResponse] = await Promise.all([
        fetch(`/api/user/${profileId}`, { cache: "no-store" }),
        fetch(`/api/posts/feed?authorId=${profileId}&limit=12`, { cache: "no-store" }),
      ]);

      const [userData, postsData] = await Promise.all([userResponse.json(), postsResponse.json()]);
      if (!userResponse.ok || !userData.ok || !userData.user) {
        setStatus(userData.error || "Profile not found.");
        setUser(null);
        setPosts([]);
        return;
      }

      setUser(userData.user);
      setPosts(postsResponse.ok && postsData.ok ? postsData.posts || [] : []);
    } catch {
      setStatus("Unable to load this profile right now.");
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-[var(--border-color)] bg-white p-8 text-center shadow-[0_18px_60px_rgba(17,24,39,0.07)]">
          <p className="text-lg font-semibold text-[var(--text-primary)]">Profile unavailable</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{status || "We couldn't find this profile."}</p>
          <div className="mt-5 flex justify-center">
            <Link className="button-clean" href="/">
              Back to feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-[var(--border-color)] bg-white shadow-[0_18px_60px_rgba(17,24,39,0.07)]">
        <div
          className="relative min-h-[220px] rounded-b-[28px] bg-[linear-gradient(135deg,#1d4ed8_0%,#0f172a_45%,#0ea5e9_100%)] bg-cover bg-center"
          style={user.coverUrl ? { backgroundImage: `linear-gradient(135deg, rgba(29,78,216,0.24) 0%, rgba(15,23,42,0.38) 52%, rgba(14,165,233,0.18) 100%), url(${user.coverUrl})` } : undefined}
        />

        <div className="px-6 pb-8 pt-0">
          <div className="-mt-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar
                alt={user.name}
                className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] sm:h-28 sm:w-28"
                src={user.avatarUrl}
              />
              <div className="pt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl">{user.name}</h1>
                  {user.verified ? <BadgeCheck className="h-5 w-5 text-[var(--accent)]" /> : null}
                </div>
                <p className="mt-1 text-base font-medium text-[var(--text-muted)]">@{user.username}</p>
                {user.bio ? <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">{user.bio}</p> : null}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Posts" value={posts.length} />
              <StatCard label="Followers" value={user.followers} />
              <StatCard label="Following" value={user.following} />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-secondary)] px-3 py-2">
              <GraduationCap className="h-4 w-4" />
              {user.collegeName || "Campus member"}
            </span>
            {user.collegeId ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-secondary)] px-3 py-2">
                <MapPin className="h-4 w-4" />
                {user.collegeId}
              </span>
            ) : null}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent posts</h2>
            <div className="mt-4 space-y-4">
              {posts.length ? (
                posts.map((post) => (
                  <div key={post.id} className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-primary)]">{post.content || "Campus update"}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
                      <span>{post.likesCount || 0} likes</span>
                      <span>{post.commentsCount || 0} comments</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-8 text-sm text-[var(--text-secondary)]">
                  No posts to show yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[var(--bg-secondary)] px-4 py-4 text-center">
      <p className="text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}
