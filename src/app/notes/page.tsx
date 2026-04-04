"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { NoteCard } from "@/components/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Upload, Filter, FileText } from "lucide-react";
import { useAppSession } from "@/hooks/use-app-session";

type NoteItem = {
  id: string;
  title: string;
  description?: string;
  subject: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: { name: string };
  downloads: number;
  views: number;
  createdAt: string;
  isOwner?: boolean;
};

const tabs = [
  { value: "all", label: "All Notes" },
  { value: "popular", label: "Popular" },
  { value: "recent", label: "Recent" },
  { value: "my", label: "My Uploads" },
];

export default function NotesPage() {
  const { user, token, isAuthenticated } = useAppSession();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function loadNotes() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        params.set("tab", tab);
        if (tab === "my" && user?.id) {
          params.set("userId", user.id);
        }

        const response = await fetch(`/api/notes?${params.toString()}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          setFeedback(data.error || "Unable to load notes right now.");
          setNotes([]);
          return;
        }

        setNotes(data.notes || []);
        setFeedback("");
      } catch {
        setFeedback("Unable to load notes right now.");
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadNotes();
    }, 250);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, tab, user?.id]);

  const heading = useMemo(() => {
    if (tab === "my") return "Your uploaded notes";
    if (tab === "popular") return "Popular notes";
    if (tab === "recent") return "Recent uploads";
    return "All notes";
  }, [tab]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated || !token) {
      setFeedback("Please log in to upload notes.");
      return;
    }

    if (!selectedFile) {
      setFeedback("Please choose a PDF file first.");
      return;
    }

    setIsUploading(true);
    setFeedback("");

    try {
      const payload = new FormData();
      payload.append("title", title.trim());
      payload.append("subject", subject.trim());
      payload.append("description", description.trim());
      payload.append("file", selectedFile);

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setFeedback(data.error || "Unable to upload note right now.");
        return;
      }

      setTitle("");
      setSubject("");
      setDescription("");
      setSelectedFile(null);
      setShowUpload(false);
      setTab("my");
      setFeedback("Note uploaded successfully.");

      const refreshResponse = await fetch(`/api/notes?tab=my&userId=${user?.id || ""}`, { cache: "no-store" });
      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok && refreshData.ok) {
        setNotes(refreshData.notes || []);
      }
    } catch {
      setFeedback("Unable to upload note right now.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8">
      <div className="mx-auto max-w-screen-lg px-4">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-title font-semibold text-[var(--text-primary)]">Class Notes</h1>
            <p className="text-caption text-[var(--text-muted)]">Upload, browse, and share real PDF notes with your campus community.</p>
          </div>
          <Button className="button-outline gap-2" onClick={() => setShowUpload((value) => !value)} type="button">
            <Upload className="h-4 w-4" />
            {showUpload ? "Close Upload" : "Upload Note"}
          </Button>
        </div>

        {showUpload ? (
          <form className="mb-6 grid gap-4 rounded-3xl border border-[var(--border-color)] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]" onSubmit={handleUpload}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Title</label>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="DBMS Unit 2 Notes" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Subject</label>
                <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="DBMS" required />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Description</label>
              <textarea
                className="input-clean min-h-[120px] w-full resize-none"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Briefly describe what this note covers."
              />
            </div>

            <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
              <label className="block text-sm font-medium text-[var(--text-primary)]">PDF file</label>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Upload one PDF up to 5MB.</p>
              <input
                className="mt-3 block w-full text-sm text-[var(--text-secondary)]"
                type="file"
                accept="application/pdf"
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                required
              />
              {selectedFile ? <p className="mt-2 text-sm text-[var(--text-primary)]">{selectedFile.name}</p> : null}
            </div>

            <div className="flex gap-3">
              <button className="button-clean" disabled={isUploading} type="submit">
                {isUploading ? "Uploading..." : "Upload note"}
              </button>
              <button className="button-outline" onClick={() => setShowUpload(false)} type="button">
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes by subject or topic..." className="input-clean pl-9" />
          </div>
          <Button variant="outline" className="gap-2" type="button">
            <Filter className="h-4 w-4" />
            Search
          </Button>
        </div>

        <Tabs defaultValue={tab} value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 gap-1 sm:grid-cols-4">
            {tabs.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="rounded-md px-4 py-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {feedback ? (
          <div className="mb-4 rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
            {feedback}
          </div>
        ) : null}

        <div className="rounded-3xl border border-[var(--border-color)] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{heading}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{notes.length} notes available right now</p>
            </div>
            <div className="rounded-2xl bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              PDF only
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-10 text-sm text-[var(--text-secondary)]">
              Loading notes...
            </div>
          ) : notes.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-[var(--text-muted)]" />
              <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">No notes found yet</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {tab === "my" ? "Upload your first PDF note to start building your study library." : "Try a different search or upload the first note for your campus."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
