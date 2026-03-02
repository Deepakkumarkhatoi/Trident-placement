import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import DriveCard from "@/components/DriveCard";

const stats = [
  { label: "Eligible Drives", value: 12, color: "primary" as const },
  { label: "Applied", value: 5, color: "info" as const },
  { label: "Shortlisted", value: 2, color: "warning" as const },
  { label: "Offer Received", value: 1, color: "success" as const },
];

const drives = [
  {
    company: "TechCorp Solutions",
    role: "Software Engineer",
    type: "On-Campus" as const,
    lpa: "8 LPA",
    cgpa: "8.0",
    lastDate: "15-03-25",
    description: "TechCorp Solutions is a leading software company specializing in AI-driven enterprise solutions.",
    initial: "T",
    color: "hsl(185, 80%, 50%)",
  },
  {
    company: "DataFlow Inc",
    role: "Data Analyst",
    type: "On-Campus" as const,
    lpa: "6.5 LPA",
    cgpa: "7.5",
    lastDate: "20-03-25",
    description: "DataFlow Inc focuses on large scale data analytics and business intelligence platforms.",
    initial: "D",
    color: "hsl(280, 60%, 55%)",
  },
  {
    company: "CloudNine Systems",
    role: "Full Stack Developer",
    type: "Virtual" as const,
    lpa: "9 LPA",
    cgpa: "8.2",
    lastDate: "25-03-25",
    description: "CloudNine Systems builds cloud-native products for global customers using modern web stacks.",
    initial: "C",
    color: "hsl(145, 65%, 45%)",
  },
];

const today = new Date();
const dateStr = today.toLocaleDateString("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).toUpperCase();

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-60">
        <TopBar />
        <main className="p-8">
          <p className="text-xs tracking-widest text-muted-foreground mb-1">{dateStr}</p>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, <span className="text-primary">Rahul</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Here's your training & placement updates.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {stats.map((s, i) => (
              <StatsCard key={s.label} {...s} delay={i * 100} />
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-widest text-muted-foreground">
              // ELIGIBLE DRIVES
            </h2>
            <button className="text-xs font-semibold text-primary hover:underline">
              View all →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {drives.map((d, i) => (
              <DriveCard key={d.company} {...d} delay={400 + i * 150} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
