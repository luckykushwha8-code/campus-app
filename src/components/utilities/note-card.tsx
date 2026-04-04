"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { FileText, Download, Eye } from "lucide-react";

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    description?: string;
    subject: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    uploadedBy: { name: string };
    downloads: number;
    views: number;
    createdAt: string;
  };
}

export function NoteCard({ note }: NoteCardProps) {
  const fileSizeInMb = note.fileSize ? `${(note.fileSize / (1024 * 1024)).toFixed(1)} MB` : "PDF";

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <FileText className="h-6 w-6 text-primary-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{note.title}</h3>
            <Badge variant="secondary">{note.subject}</Badge>
          </div>
          {note.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{note.description}</p>
          )}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span>By {note.uploadedBy.name}</span>
            <span>{formatDate(note.createdAt)}</span>
            <span>{fileSizeInMb}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Link
          href={`/api/notes/${note.id}?action=view`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <Eye className="h-3 w-3" />
          {note.views}
        </Link>
        <Link
          href={`/api/notes/${note.id}?action=download`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          <Download className="h-3 w-3" />
          {note.downloads}
        </Link>
      </div>
    </div>
  );
}
