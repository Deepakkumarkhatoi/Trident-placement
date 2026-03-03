import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, GraduationCap, Award, Edit } from "lucide-react";

const Profile = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">My Profile</h1>
          <Button variant="outline" size="sm" className="text-xs">
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Header */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-6 opacity-0 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-xl md:text-2xl font-display font-bold text-primary shrink-0">
              R
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground">Rahul Sharma</h2>
              <p className="text-sm text-muted-foreground">B.Tech — Computer Science & Engineering</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 md:gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> rahul.sharma@tat.edu</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> +91 98765 43210</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Mumbai, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Info */}
          <div className="bg-card border border-border rounded-xl p-4 md:p-6 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <h3 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Academic Details
            </h3>
            <div className="space-y-4">
              {[
                { label: "Current CGPA", value: "8.4 / 10" },
                { label: "Batch", value: "2023 — 2027" },
                { label: "Roll Number", value: "CSE-2023-042" },
                { label: "Department", value: "Computer Science & Engineering" },
                { label: "10th Score", value: "92.4%" },
                { label: "12th Score", value: "89.8%" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-card border border-border rounded-xl p-4 md:p-6 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h3 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
              <Award className="w-4 h-4" /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {["React", "TypeScript", "Node.js", "Python", "SQL", "AWS", "Docker", "Git", "Machine Learning", "REST APIs"].map((skill) => (
                <span key={skill} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground border border-border">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
