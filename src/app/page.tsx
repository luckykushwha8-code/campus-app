import { Stories, CreatePost, PostCard } from "@/components/feed";
import { formatRelative } from "date-fns";

const mockPosts = [
  {
    id: "1",
    content: "Hey everyone! Just posted the DBMS notes for the mid-semester exam. Check them out in the Notes section! 📚",
    images: ["https://picsum.photos/seed/post1/600/400"],
    author: {
      id: "1",
      name: "Rahul Sharma",
      username: "rahul_sharma",
      avatar: undefined, // Changed from null to undefined
      institution: "NIT Trichy",
    },
    likesCount: 45,
    commentsCount: 12,
    isLiked: false,
    isSaved: false,
    createdAt: formatRelative(new Date(Date.now() - 3600000), new Date()), // Convert to relative time string
  },
  {
    id: "2",
    content: "Tech Club is organizing a hackathon next month! Registrations are open. Form your teams and participate 🚀\n\n#TechClub #Hackathon #NITTrichy",
    author: {
      id: "2",
      name: "Priya Patel",
      username: "priya_patel",
      avatar: undefined, // Changed from null to undefined
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
    content: "Placement season is here! Remember to check the Placement Cell room for all the latest updates on company visits and interview experiences. All the best to everyone appearing! 💼",
    author: {
      id: "3",
      name: "Placement Cell",
      username: "placement_cell",
      avatar: undefined, // Changed from null to undefined
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
      <div className="mx-auto max-w-screen-lg px-4 py-8">
        <Stories />
        <div className="mt-6">
          <CreatePost />
        </div>
        <div className="mt-6 space-y-6">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={{ ...post, createdAt: post.createdAt }} />
          ))}
        </div>
      </div>
    </div>
  );
}