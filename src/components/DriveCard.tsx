import { Button } from "@/components/ui/button";

interface DriveCardProps {
  company: string;
  role: string;
  type: "On-Campus" | "Virtual";
  lpa: string;
  cgpa: string;
  lastDate: string;
  description: string;
  initial: string;
  color: string;
  delay?: number;
}

const DriveCard = ({ company, role, type, lpa, cgpa, lastDate, description, initial, color, delay = 0 }: DriveCardProps) => {
  return (
    <div
      className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col justify-between hover:border-primary/30 transition-all duration-300 opacity-0 animate-fade-in min-w-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground"
              style={{ backgroundColor: color }}
            >
              {initial}
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground text-sm">{company}</h3>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
          </div>
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${
              type === "On-Campus"
                ? "text-success border-success/30 bg-success/10"
                : "text-info border-info/30 bg-info/10"
            }`}
          >
            {type}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
          <div>
            <p className="text-muted-foreground uppercase tracking-wider text-[10px]">LPA Package</p>
            <p className="font-semibold text-foreground">{lpa}</p>
          </div>
          <div>
            <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Min CGPA</p>
            <p className="font-semibold text-foreground">{cgpa}</p>
          </div>
          <div>
            <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Last Date</p>
            <p className="font-semibold text-foreground">{lastDate}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">{description}</p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs">
          View Details
        </Button>
        <Button size="sm" className="flex-1 text-xs">
          Apply Now →
        </Button>
      </div>
    </div>
  );
};

export default DriveCard;
