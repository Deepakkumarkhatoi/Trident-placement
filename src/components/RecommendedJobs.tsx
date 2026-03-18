'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Briefcase, MapPin, IndianRupee, Bookmark } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface RecommendedJob {
  id?: string;
  company: string;
  role: string;
  lpa: string;
  location: string;
  skills: string[];
  match: number;
}

const RecommendedJobs = () => {
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '250ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Recommended For You
        </h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border/50 rounded-lg p-4 animate-pulse bg-secondary/10 h-32"></div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-muted-foreground text-sm">No recommended jobs available at the moment.</p>
      ) : (
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
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-secondary text-white-foreground border border-border">
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
      )}
    </div>
  );
};

export default RecommendedJobs;
