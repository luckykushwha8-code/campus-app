"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { FileText, Download, Eye } from "lucide-react";

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    description?: string;
    subject: string;
    uploadedBy: { name: string };
    downloads: number;
    views: number;
    createdAt: string;
  };
}

export function NoteCard({ note }: NoteCardProps) {
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
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex-1 gap-1">
          <Eye className="h-3 w-3" />
          {note.views}
        </Button>
        <Button size="sm" className="flex-1 gap-1">
          <Download className="h-3 w-3" />
          {note.downloads}
        </Button>
      </div>
    </div>
  );
}
