import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/feed";
import { Settings, Edit, UserPlus, MapPin, Calendar, GraduationCap, CheckCircle, BadgeCheck } from "lucide-react";
import { formatRelative } from "date-fns";

const mockUser = {
  name: "Rahul Sharma",
  username: "rahul_sharma",
  email: "rahul.sharma@nit.edu.in",
  avatar: undefined,
  bio: "CSE Student | Tech Enthusiast | Always learning something new",
  institution: "NIT Trichy",
  department: "Computer Science",
  graduationYear: 2025,
  city: "Tiruchirappalli",
  isVerified: true,
};

const mockPosts = [
  {
    id: "1",
    content: "Just completed my first hackathon! Great experience building something in 24 hours 🚀",
    author: {
      id: "1",
      name: "Rahul Sharma",
      username: "rahul_sharma",
      institution: "NIT Trichy",
    },
    likesCount: 89,
    commentsCount: 23,
    isLiked: false,
    isSaved: false,
    createdAt: formatRelative(new Date(Date.now() - 86400000 * 2), new Date()),
  },
  {
    id: "2",
    content: "Sharing DBMS notes for upcoming mid-semester. Link in bio! 📚",
    images: ["https://picsum.photos/seed/post2/600/400"],
    author: {
      id: "1",
      name: "Rahul Sharma",
      username: "rahul_sharma",
      institution: "NIT Trichy",
    },
    likesCount: 156,
    commentsCount: 45,
    isLiked: true,
    isSaved: true,
    createdAt: formatRelative(new Date(Date.now() - 86400000 * 5), new Date()),
  },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-screen-lg px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <Avatar alt={mockUser.name} src={mockUser.avatar} className="h-10 w-10" />
            <div>
              <h1 className="text-title font-semibold text-[var(--text-primary)]">{mockUser.name}</h1>
              {mockUser.isVerified && (
                <BadgeCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
              )}
            </div>
          </div>
          <p className="text-caption text-[var(--text-muted)]">@{mockUser.username}</p>
        </div>
        
        <div className="mb-6">
          {mockUser.bio && <p className="text-body text-[var(--text-primary)]">{mockUser.bio}</p>}
        </div>
        
        <div className="mb-6 flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            {mockUser.department}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {mockUser.city}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Class of {mockUser.graduationYear}
          </span>
        </div>
        
        <div className="mb-6 flex gap-4 text-center">
          <div>
            <p className="text-body font-medium text-[var(--text-primary)]">156</p>
            <p className="text-caption text-[var(--text-muted)]">Posts</p>
          </div>
          <div>
            <p className="text-body font-medium text-[var(--text-primary)]">1.2K</p>
            <p className="text-caption text-[var(--text-muted)]">Followers</p>
          </div>
          <div>
            <p className="text-body font-medium text-[var(--text-primary)]">89</p>
            <p className="text-caption text-[var(--text-muted)]">Following</p>
          </div>
        </div>
        
        <div className="mb-6">
          <button className="button-outline gap-2 flex items-center">
            <Edit className="h-4 w-4" />
            Edit Profile
          </button>
          <button className="button-ghost gap-2 flex items-center">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}