import { Card, CardContent } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  loading?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
  loading = false,
}: StatsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-3xl font-bold text-foreground mt-2">{value.toLocaleString()}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
