import { Stories, CreatePost, PostCard } from "@/components/feed";
import { formatRelative } from "date-fns";

const mockPosts = [
  {
    id: "1",
    content: "I just uploaded DBMS notes for the mid-sem exam. They are in the Notes section for everyone in our batch.",
    images: ["https://picsum.photos/seed/post1/600/400"],
    author: {
      id: "1",
      name: "Rahul Sharma",
      username: "rahul_sharma",
      avatar: undefined,
      institution: "NIT Trichy",
    },
    likesCount: 45,
    commentsCount: 12,
    isLiked: false,
    isSaved: false,
    createdAt: formatRelative(new Date(Date.now() - 3600000), new Date()),
  },
  {
    id: "2",
    content: "Tech Club is organizing a hackathon next month. Registrations are open now, so form your teams and join early.\n\n#TechClub #Hackathon #NITTrichy",
    author: {
      id: "2",
      name: "Priya Patel",
      username: "priya_patel",
      avatar: undefined,
      institution: "NIT Trichy",
    },
    likesCount: 89,
    commentsCount: 34,
    isLiked: true,
    isSaved: false,
    createdAt: formatRelative(new Date(Date.now() - 7200000), new Date()),
  },
  {
    id: "3",
    content: "Placement season is here. Check the Placement Cell room for company visits, interview experiences, and resume tips.",
    author: {
      id: "3",
      name: "Placement Cell",
      username: "placement_cell",
      avatar: undefined,
      institution: "NIT Trichy",
    },
    likesCount: 156,
    commentsCount: 45,
    isLiked: false,
    isSaved: true,
    createdAt: formatRelative(new Date(Date.now() - 86400000), new Date()),
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-3xl space-y-5">
        <Stories />
        <CreatePost />
        <div className="space-y-5">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
