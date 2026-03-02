import { Calendar, Clock, MapPin, Video } from "lucide-react";

const events = [
  {
    title: "Pre-Placement Talk — InnoTech Labs",
    date: "March 5, 2026",
    time: "10:00 AM",
    location: "Seminar Hall B",
    type: "PPT",
    color: "text-info bg-info/10",
  },
  {
    title: "Mock Interview Session",
    date: "March 8, 2026",
    time: "2:00 PM",
    location: "Online (Zoom)",
    type: "Workshop",
    color: "text-primary bg-primary/10",
  },
  {
    title: "Resume Building Workshop",
    date: "March 10, 2026",
    time: "11:00 AM",
    location: "Lab 3, CS Block",
    type: "Workshop",
    color: "text-warning bg-warning/10",
  },
  {
    title: "TechCorp — Technical Round",
    date: "March 12, 2026",
    time: "9:00 AM",
    location: "Online",
    type: "Interview",
    color: "text-success bg-success/10",
  },
];

const UpcomingEvents = () => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: "150ms" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
          // Upcoming Events
        </h3>
        <button className="text-xs font-semibold text-primary hover:underline">View Calendar →</button>
      </div>

      <div className="space-y-3">
        {events.map((e, i) => (
          <div
            key={e.title}
            className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-all hover-scale"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${e.color}`}>
              {e.type === "Interview" ? (
                <Video className="w-4 h-4" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{e.title}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {e.date} • {e.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {e.location}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${e.color} border-current/20 shrink-0`}>
              {e.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEvents;
