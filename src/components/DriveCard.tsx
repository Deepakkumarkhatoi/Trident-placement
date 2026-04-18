import { Button } from '@/src/components/ui/button';
import Link from 'next/link';
import { isDriveActive } from '@/src/lib/utils';
import { useState } from 'react';
import { useToast } from '@/src/hooks/use-toast';
import { studentApplicationsApi } from '@/src/lib/api/student.applications';

interface DriveCardProps {
  id: string;
  company: string;
  role: string;
  type:  string;
  lpa: string;
  cgpa: string;
  lastDate: string;
  description: string;
  initial: string;
  color: string;
  delay?: number;
  applied?: boolean;
  onApplySuccess?: () => void;
}

const DriveCard = ({ 
  id, 
  company, 
  role, 
  type, 
  lpa, 
  cgpa, 
  lastDate, 
  description, 
  initial, 
  color, 
  delay = 0, 
  applied = false,
  onApplySuccess 
}: DriveCardProps) => {
  const isActive = isDriveActive(lastDate);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(applied);
  const { toast } = useToast();
  
  const handleApply = async () => {
    if (!isActive) {
      toast({
        title: 'Drive Closed',
        description: 'This drive is no longer accepting applications.',
        variant: 'destructive',
      });
      return;
    }

    if (hasApplied) {
      toast({
        title: 'Already Applied',
        description: 'You have already applied to this drive.',
        variant: 'destructive',
      });
      return;
    }

    setIsApplying(true);
    try {
      const driveId = parseInt(id, 10);
      await studentApplicationsApi.apply(driveId);
      
      setHasApplied(true);
      toast({
        title: 'Application Submitted',
        description: `Successfully applied to ${company}. Good luck!`,
      });

      // Notify parent component of successful application
      if (onApplySuccess) {
        onApplySuccess();
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to submit application';
      toast({
        title: 'Application Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsApplying(false);
    }
  };
  
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
          <div className="flex flex-row gap-2 items-center">
            <span
              className={`text-[10px] font-semibold px-2 py-1 rounded-md border ${
                isActive
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-red-100 text-red-700 border-red-200'
              }`}
            >
              {isActive ? 'ACTIVE' : 'CLOSED'}
            </span>
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${
                type === 'On-Campus'
                  ? 'text-success border-success/30 bg-success/10'
                  : 'text-info border-info/30 bg-info/10'
              }`}
            >
              {type}
            </span>
          </div>
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
        <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
          <Link href={`/drives/${id}`}>View Details</Link>
        </Button>
        {!hasApplied ? (
          <Button 
            size="sm" 
            className="flex-1 text-xs" 
            onClick={handleApply}
            disabled={isApplying}
            variant={isActive ? 'default' : 'secondary'}
          >
            {isApplying ? (
              <>
                <span className="inline-block mr-2">⏳</span>
                Applying...
              </>
            ) : isActive ? (
              <>Apply Now →</>
            ) : (
              <>Closed</>
            )}
          </Button>
        ) : (
          <Button size="sm" className="flex-1 text-xs bg-green-500/20 text-green-600 hover:bg-green-500/30 cursor-not-allowed" disabled>
            ✓ Applied
          </Button>
        )}
      </div>
    </div>
  );
};

export default DriveCard;
