"use client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface MarketplaceCardProps {
  item: {
    id: string;
    title: string;
    description?: string;
    price: number;
    images?: string[];
    category: string;
    condition?: string;
    postedBy: { name: string };
    createdAt: string; // This is now a string from formatRelative
  };
}

export function MarketplaceCard({ item }: MarketplaceCardProps) {
  return (
    <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-primary)]">
      {item.images && item.images[0] && (
        <Image src={item.images[0]} alt={item.title} className="w-full h-48 object-cover" width={800} height={384} />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-body font-semibold text-[var(--text-primary)]">{item.title}</h3>
          <span className="text-body font-medium text-[var(--accent)]">Rs {item.price}</span>
        </div>

        {item.description && (
          <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">{item.description}</p>
        )}

        <div className="mt-3 flex items-center gap-3">
          <Badge variant="secondary" className="text-xs">
            {item.category}
          </Badge>
          {item.condition && (
            <Badge variant="secondary" className="text-xs">
              {item.condition}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-caption text-[var(--text-muted)]">Posted {item.createdAt}</span>
          <Button size="sm" variant="outline" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Contact
          </Button>
        </div>
      </div>
    </div>
  );
}
