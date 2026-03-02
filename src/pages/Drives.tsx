import DashboardLayout from "@/components/DashboardLayout";
import DriveCard from "@/components/DriveCard";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

const allDrives = [
  { company: "TechCorp Solutions", role: "Software Engineer", type: "On-Campus" as const, lpa: "8 LPA", cgpa: "8.0", lastDate: "15-03-25", description: "TechCorp Solutions is a leading software company specializing in AI-driven enterprise solutions.", initial: "T", color: "hsl(185, 80%, 50%)" },
  { company: "DataFlow Inc", role: "Data Analyst", type: "On-Campus" as const, lpa: "6.5 LPA", cgpa: "7.5", lastDate: "20-03-25", description: "DataFlow Inc focuses on large scale data analytics and business intelligence platforms.", initial: "D", color: "hsl(280, 60%, 55%)" },
  { company: "CloudNine Systems", role: "Full Stack Developer", type: "Virtual" as const, lpa: "9 LPA", cgpa: "8.2", lastDate: "25-03-25", description: "CloudNine Systems builds cloud-native products for global customers using modern web stacks.", initial: "C", color: "hsl(145, 65%, 45%)" },
  { company: "InnoTech Labs", role: "ML Engineer", type: "On-Campus" as const, lpa: "12 LPA", cgpa: "8.5", lastDate: "28-03-25", description: "InnoTech Labs pioneers machine learning solutions for healthcare and fintech sectors.", initial: "I", color: "hsl(35, 90%, 55%)" },
  { company: "ByteWave Corp", role: "Backend Developer", type: "Virtual" as const, lpa: "7 LPA", cgpa: "7.0", lastDate: "30-03-25", description: "ByteWave Corp provides scalable backend infrastructure services to startups worldwide.", initial: "B", color: "hsl(0, 70%, 55%)" },
  { company: "NexGen Solutions", role: "DevOps Engineer", type: "On-Campus" as const, lpa: "10 LPA", cgpa: "7.8", lastDate: "02-04-25", description: "NexGen Solutions delivers cutting-edge CI/CD and cloud infrastructure management tools.", initial: "N", color: "hsl(210, 80%, 55%)" },
];

const Drives = () => {
  const [filter, setFilter] = useState<"All" | "On-Campus" | "Virtual">("All");
  const [search, setSearch] = useState("");

  const filtered = allDrives.filter((d) => {
    const matchType = filter === "All" || d.type === filter;
    const matchSearch = d.company.toLowerCase().includes(search.toLowerCase()) || d.role.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-display font-bold text-foreground">Placement Drives</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-8">Browse and apply to available placement opportunities.</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies or roles..."
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          {(["All", "On-Campus", "Virtual"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              <Filter className="w-3 h-3 inline mr-1.5" />
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} drives found</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((d, i) => (
          <DriveCard key={d.company} {...d} delay={i * 100} />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Drives;
