import { JobCard } from "@/components/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Briefcase, TrendingUp, Filter } from "lucide-react";
import { formatRelative } from "date-fns";

const mockJobs = [
  {
    id: "1",
    title: "Software Development Engineer",
    company: "Google",
    description: "Looking for talented SDEs to join our team. Must have strong problem-solving skills and knowledge of data structures.",
    jobType: "full-time",
    location: "Bangalore",
    salary: "₹25-35 LPA",
    applyLink: "https://careers.google.com",
    postedBy: { name: "Placement Cell" },
    createdAt: formatRelative(new Date(Date.now() - 86400000), new Date()),
  },
  {
    id: "2",
    title: "Summer Internship 2025",
    company: "Microsoft",
    description: "4-month internship program for pre-final year students. Domains: SDE, ML, Web Dev.",
    jobType: "internship",
    location: "Hyderabad",
    salary: "₹50,000/month",
    applyLink: "https://careers.microsoft.com",
    postedBy: { name: "Placement Cell" },
    createdAt: formatRelative(new Date(Date.now() - 172800000), new Date()),
  },
  {
    id: "3",
    title: "Product Manager Intern",
    company: "Amazon",
    description: "Summer internship for MBA and B.Tech students interested in product management.",
    jobType: "internship",
    location: "Bangalore",
    salary: "₹45,000/month",
    applyLink: "https://amazon.jobs",
    postedBy: { name: "Placement Cell" },
    createdAt: formatRelative(new Date(Date.now() - 259200000), new Date()),
  },
  {
    id: "4",
    title: "Frontend Developer",
    company: "Flipkart",
    description: "Part-time opportunity for final year students. Work on e-commerce platform.",
    jobType: "part-time",
    location: "Bangalore",
    salary: "₹30,000/month",
    applyLink: "https://flipkart.com",
    postedBy: { name: "Tech Club" },
    createdAt: formatRelative(new Date(Date.now() - 345600000), new Date()),
  },
];

export default function PlacementsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8">
      <div className="mx-auto max-w-screen-lg px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-title font-semibold text-[var(--text-primary)] mb-2">Placements & Internships</h1>
            <p className="text-caption text-[var(--text-muted)]">Latest job opportunities and internship updates</p>
          </div>
          <Button className="button-outline gap-2">
            <Plus className="h-4 w-4" />
            Post Job
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--accent)]/10 rounded-xl p-4 text-[var(--accent)]">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-5 w-5" />
              <span className="font-semibold">Active Listings</span>
            </div>
            <p className="text-body font-medium">24</p>
          </div>
          <div className="bg-[var(--accent)]/10 rounded-xl p-4 text-[var(--accent)]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="font-semibold">This Week</span>
            </div>
            <p className="text-body font-medium">8</p>
          </div>
          <div className="bg-[var(--accent)]/10 rounded-xl p-4 text-[var(--accent)]">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-5 w-5" />
              <span className="font-semibold">Internships</span>
            </div>
            <p className="text-body font-medium">15</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <Input placeholder="Search jobs by title, company..." className="input-clean pl-9" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-2 gap-1 mb-6">
            <TabsTrigger value="all" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">All Jobs</TabsTrigger>
            <TabsTrigger value="internship" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Internships</TabsTrigger>
            <TabsTrigger value="full-time" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Full-time</TabsTrigger>
            <TabsTrigger value="part-time" className="px-4 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors data-[state=active]:bg-[var(--bg-secondary)] data-[state=active]:text-[var(--accent)]">Part-time</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              <div className="sm:grid-cols-2 lg:grid-cols-3">
                {mockJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="internship">
            <div className="space-y-4">
              <div className="text-center py-12">
                <p className="text-caption text-[var(--text-muted)]">Internship listings will appear here</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="full-time">
            <div className="space-y-4">
              <div className="text-center py-12">
                <p className="text-caption text-[var(--text-muted)]">Full-time job listings will appear here</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="part-time">
            <div className="space-y-4">
              <div className="text-center py-12">
                <p className="text-caption text-[var(--text-muted)]">Part-time job listings will appear here</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}