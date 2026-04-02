"use client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { MapPin, User } from "lucide-react";

interface LostItemCardProps {
  item: {
    id: string;
    title: string;
    description?: string;
    image?: string;
    location?: string;
    status: string;
    postedBy: { name: string };
    createdAt: string;
  };
}

export function LostItemCard({ item }: LostItemCardProps) {
  const statusColors: Record<string, string> = {
    lost: "danger",
    found: "success",
    claimed: "secondary",
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {item.image && (
        <Image src={item.image} alt={item.title} className="w-full h-40 object-cover" width={800} height={320} />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{item.title}</h3>
          <Badge variant={statusColors[item.status] as "default" | "secondary" | "success" | "danger"}>
            {item.status}
          </Badge>
        </div>
        {item.description && (
          <p className="mt-2 text-sm text-gray-600">{item.description}</p>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          {item.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {item.postedBy.name}
          </span>
          <span>{formatDate(item.createdAt)}</span>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-3">
          {item.status === "lost" ? "I Found It" : "Claim Item"}
        </Button>
      </div>
    </div>
  );
}
