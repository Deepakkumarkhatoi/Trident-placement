import { CheckCircle2, Circle, AlertTriangle, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ChecklistItem {
  label: string;
  done: boolean;
  critical?: boolean;
}

const items: ChecklistItem[] = [
  { label: "Upload Resume (PDF)", done: true, critical: true },
  { label: "Complete Profile Details", done: true, critical: true },
  { label: "Upload 10th Marksheet", done: true },
  { label: "Upload 12th Marksheet", done: true },
  { label: "Upload Semester Marksheets", done: false, critical: true },
  { label: "Upload ID Proof (Aadhar/PAN)", done: false, critical: true },
  { label: "Add Skills & Certifications", done: true },
  { label: "Upload Passport Size Photo", done: false },
  { label: "Consent Form Signed", done: false, critical: true },
  { label: "Verify Email & Phone", done: true },
];

const PlacementChecklist = () => {
  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);
  const pendingCritical = items.filter((i) => !i.done && i.critical);

  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
          // Placement Readiness
        </h3>
        <span className="text-xs font-bold text-primary">{pct}%</span>
      </div>

      <Progress value={pct} className="h-2 mb-4" />

      {pendingCritical.length > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-warning">Action Required</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {pendingCritical.length} mandatory item(s) pending. Complete them to be eligible for drives.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 text-sm py-1.5 ${
              item.done ? "opacity-60" : ""
            }`}
          >
            {item.done ? (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <span className={`flex-1 ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {item.label}
            </span>
            {item.critical && !item.done && (
              <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">Required</span>
            )}
          </div>
        ))}
      </div>

      <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
        <Upload className="w-3.5 h-3.5" />
        Upload Documents
      </button>
    </div>
  );
};

export default PlacementChecklist;
