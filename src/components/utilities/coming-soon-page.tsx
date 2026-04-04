import Link from "next/link";
import { LucideIcon, ArrowLeft, Sparkles } from "lucide-react";

type ComingSoonPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  highlights: string[];
};

export function ComingSoonPage({
  eyebrow,
  title,
  description,
  icon: Icon,
  highlights,
}: ComingSoonPageProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[32px] border border-[var(--border-color)] bg-white p-5 shadow-[0_18px_60px_rgba(17,24,39,0.07)] sm:p-6 lg:p-8">
          <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(37,99,235,0.12)_0%,rgba(15,23,42,0.04)_48%,rgba(14,165,233,0.12)_100%)] px-5 py-6 sm:px-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-medium text-[var(--accent)]">{eyebrow}</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl">{title}</h1>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)] sm:text-base">{description}</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white text-[var(--accent)] shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
                <Icon className="h-7 w-7" />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-[var(--accent)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">This space is being finished properly</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    We hid unfinished interactions and replaced them with a clear status so the app feels trustworthy while this feature is completed.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {highlights.map((item) => (
                  <div key={item} className="rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">What you can use now</h2>
              <div className="mt-4 space-y-3">
                <Link href="/" className="button-clean w-full">
                  Go to feed
                </Link>
                <Link href="/rooms" className="button-outline w-full">
                  Open rooms
                </Link>
                <Link href="/events" className="button-outline w-full">
                  Browse events
                </Link>
                <Link href="/clubs" className="button-outline w-full">
                  Explore clubs
                </Link>
                <Link href="/explore" className="button-ghost w-full">
                  <ArrowLeft className="h-4 w-4" />
                  Back to explore
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
