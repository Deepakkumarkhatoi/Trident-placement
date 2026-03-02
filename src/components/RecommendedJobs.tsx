import { TrendingUp, Briefcase, MapPin, IndianRupee, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

const jobs = [
  {
    company: "Wipro Technologies",
    role: "Project Engineer",
    lpa: "3.5 LPA",
    location: "Bengaluru",
    skills: ["Java", "SQL", "Spring Boot"],
    match: 92,
    hot: true,
  },
  {
    company: "Infosys",
    role: "Systems Engineer",
    lpa: "3.6 LPA",
    location: "Pune",
    skills: ["Python", "SQL", "Linux"],
    match: 85,
    hot: false,
  },
  {
    company: "Cognizant",
    role: "Programmer Analyst",
    lpa: "4 LPA",
    location: "Chennai",
    skills: ["React", "Node.js", "MongoDB"],
    match: 88,
    hot: true,
  },
];

const RecommendedJobs = () => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: "250ms" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Recommended For You
        </h3>
      </div>

      <div className="space-y-3">
        {jobs.map((j) => (
          <div
            key={j.company + j.role}
            className="border border-border/50 rounded-lg p-4 hover:border-primary/20 transition-all hover-scale"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">{j.role}</h4>
                  {j.hot && (
                    <span className="text-[9px] font-bold bg-destructive/15 text-destructive px-1.5 py-0.5 rounded">
                      🔥 HOT
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> {j.company}
                </p>
              </div>
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{j.lpa}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{j.location}</span>
              <span className="text-primary font-semibold">{j.match}% match</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {j.skills.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border">
                    {s}
                  </span>
                ))}
              </div>
              <Button size="sm" className="text-xs h-7 px-3">
                Quick Apply
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedJobs;
