"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { MapPin, Building, DollarSign, ExternalLink } from "lucide-react";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company?: string;
    description: string;
    jobType: string;
    location?: string;
    salary?: string;
    applyLink?: string;
    postedBy: { name: string };
    createdAt: string;
  };
}

export function JobCard({ job }: JobCardProps) {
  const typeColors: Record<string, string> = {
    internship: "success",
    "full-time": "default",
    "part-time": "warning",
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{job.title}</h3>
          {job.company && (
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
              <Building className="h-4 w-4" />
              {job.company}
            </div>
          )}
        </div>
        <Badge variant={typeColors[job.jobType] as "default" | "success" | "warning" | "danger"}>
          {job.jobType}
        </Badge>
      </div>

      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{job.description}</p>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.location}
          </span>
        )}
        {job.salary && (
          <span className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            {job.salary}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">{formatDate(job.createdAt)}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Details</Button>
          {job.applyLink && (
            <Button size="sm" className="gap-1">
              Apply
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
