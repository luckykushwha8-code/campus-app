"use client";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";

interface ClubCardProps {
  club: {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    membersCount: number;
    isMember: boolean;
  };
}

export function ClubCard({ club }: ClubCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Avatar alt={club.name} src={club.logo} className="h-12 w-12" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{club.name}</h3>
          {club.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{club.description}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          {club.membersCount} members
        </div>
        <Button variant={club.isMember ? "outline" : "default"} size="sm" className="gap-1">
          {club.isMember ? "Joined" : (
            <>
              <UserPlus className="h-4 w-4" />
              Join
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
