'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle, Zap, BookOpen, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';

interface ShortlistStatus {
  driveId: number;
  companyName: string;
  role: string;
  rounds: {
    APTI?: 'PENDING' | 'PASSED' | 'FAILED';
    DSA?: 'PENDING' | 'PASSED' | 'FAILED';
    TECHNICAL?: 'PENDING' | 'PASSED' | 'FAILED';
  };
  lastUpdateDate?: string;
}

interface Props {
  shortlistData?: ShortlistStatus[];
}

const ROUND_CONFIG = {
  APTI: {
    icon: Zap,
    label: 'Aptitude',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
  },
  DSA: {
    icon: BookOpen,
    label: 'DSA',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
  },
  TECHNICAL: {
    icon: Users,
    label: 'Technical',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50',
  },
};

function RoundStatusBadge({ status, roundType }: { status?: string; roundType: keyof typeof ROUND_CONFIG }) {
  const config = ROUND_CONFIG[roundType];
  const Icon = config.icon;

  if (!status) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
        <Clock className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Pending</span>
      </div>
    );
  }

  if (status === 'PASSED') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-700">Shortlisted</span>
      </div>
    );
  }

  if (status === 'FAILED') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
        <XCircle className="w-4 h-4 text-red-600" />
        <span className="text-sm font-medium text-red-700">Not Selected</span>
      </div>
    );
  }

  return null;
}

function RoundProgressCard({ shortlist }: { shortlist: ShortlistStatus }) {
  const passedRounds = Object.values(shortlist.rounds).filter((s) => s === 'PASSED').length;
  const totalRounds = 3;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{shortlist.companyName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{shortlist.role}</p>
          </div>
          <Badge variant="outline" className="whitespace-nowrap">
            Round {passedRounds + 1}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Timeline */}
        <div className="space-y-3">
          {(['APTI', 'DSA', 'TECHNICAL'] as const).map((roundType, idx) => {
            const status = shortlist.rounds[roundType];
            const isPassed = status === 'PASSED';
            const isFailed = status === 'FAILED';
            const isPending = !status;
            const config = ROUND_CONFIG[roundType];
            const Icon = config.icon;

            return (
              <div key={roundType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isPassed
                          ? 'bg-emerald-100'
                          : isFailed
                            ? 'bg-red-100'
                            : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isPassed
                            ? 'text-emerald-600'
                            : isFailed
                              ? 'text-red-600'
                              : 'text-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{config.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {isPassed && 'You made it to the next round!'}
                        {isFailed && 'Unfortunately, you were not selected'}
                        {isPending && 'Awaiting results...'}
                      </p>
                    </div>
                  </div>
                  <RoundStatusBadge status={status} roundType={roundType} />
                </div>

                {/* Connector line */}
                {idx < 2 && (
                  <div className="ml-6 h-3 border-l-2 border-dashed border-gray-300" />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2 border-t border-gray-200">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2" size="sm">
              <FileText className="w-4 h-4" />
              View Drive Details
            </Button>
            <Button className="flex-1 gap-2" size="sm" disabled={!shortlist.rounds.APTI}>
              <CheckCircle2 className="w-4 h-4" />
              Apply Next Round
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ShortlistStatusWidget
 *
 * Display shortlisting status for all drives a student has applied to
 * Shows progress through Apti → DSA → Technical rounds
 *
 * Usage:
 * ```tsx
 * <ShortlistStatusWidget
 *   shortlistData={[
 *     {
 *       driveId: 1,
 *       companyName: "TCS",
 *       role: "Software Engineer",
 *       rounds: {
 *         APTI: "PASSED",
 *         DSA: "PENDING",
 *       }
 *     }
 *   ]}
 * />
 * ```
 */
export function ShortlistStatusWidget({ shortlistData }: Props) {
  const [data, setData] = useState<ShortlistStatus[]>(shortlistData || []);
  const [loading, setLoading] = useState(!shortlistData);

  useEffect(() => {
    if (!shortlistData) {
      // Fetch from API
      const fetchShortlistData = async () => {
        try {
          const response = await fetch('/api/student/shortlist/status');
          if (response.ok) {
            const result = await response.json();
            setData(result.data || []);
          }
        } catch (error) {
          console.error('Failed to fetch shortlist data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchShortlistData();
    }
  }, [shortlistData]);

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center text-muted-foreground">
          Loading shortlist data...
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm font-medium text-foreground">No Active Drives</p>
            <p className="text-xs text-muted-foreground">
              You haven't applied to any drives yet or no shortlisting updates are available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">📋 Your Shortlisting Status</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.map((shortlist) => (
          <RoundProgressCard key={shortlist.driveId} shortlist={shortlist} />
        ))}
      </div>
    </div>
  );
}

/**
 * ShortlistNotificationBanner
 *
 * Prominent notification banner when student is shortlisted/rejected
 */
export function ShortlistNotificationBanner({
  company,
  round,
  status,
  onDismiss,
}: {
  company: string;
  round: 'APTI' | 'DSA' | 'TECHNICAL';
  status: 'PASSED' | 'FAILED';
  onDismiss?: () => void;
}) {
  const config = ROUND_CONFIG[round];
  const Icon = status === 'PASSED' ? CheckCircle2 : XCircle;
  const bgColor = status === 'PASSED' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200';
  const textColor = status === 'PASSED' ? 'text-emerald-700' : 'text-red-700';
  const accentColor = status === 'PASSED' ? 'text-emerald-600' : 'text-red-600';

  const message =
    status === 'PASSED'
      ? `Congratulations! You've been shortlisted for the ${config.label} round at ${company}`
      : `Unfortunately, you didn't make it past the ${config.label} round at ${company}`;

  return (
    <Card className={`border ${bgColor}`}>
      <CardContent className="pt-6 flex items-start gap-4">
        <Icon className={`w-6 h-6 ${accentColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`font-semibold ${textColor}`}>{message}</p>
          {status === 'PASSED' && (
            <p className={`text-sm ${textColor} opacity-75 mt-1`}>
              Prepare well and check your email for next round details
            </p>
          )}
        </div>
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss} className={textColor}>
            ✕
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
