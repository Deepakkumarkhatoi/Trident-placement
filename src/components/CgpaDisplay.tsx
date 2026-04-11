'use client';

import { useState, useEffect } from 'react';
import { adminCgpaApi, StudentCgpaInfo } from '@/src/lib/api/admin.cgpa';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { RefreshCw, Loader } from 'lucide-react';
import { useToast } from '@/src/hooks/use-toast';

interface CgpaDisplayProps {
  regdno: string;
  initialCgpa?: number | string;
  initialLastUpdated?: string;
  onRefresh?: () => void;
}

export default function CgpaDisplay({ regdno, initialCgpa, initialLastUpdated, onRefresh }: CgpaDisplayProps) {
  const [cgpaInfo, setCgpaInfo] = useState<StudentCgpaInfo | null>(
    initialCgpa ? {
      regdno,
      name: '',
      cgpa: typeof initialCgpa === 'string' ? parseFloat(initialCgpa) : initialCgpa,
      lastUpdated: initialLastUpdated || new Date().toISOString(),
    } : null
  );
  const [loading, setLoading] = useState(!initialCgpa);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only load from API if no initial CGPA provided
    if (!initialCgpa) {
      loadCgpaInfo();
    }
  }, [regdno, initialCgpa]);

  const loadCgpaInfo = async () => {
    try {
      setLoading(true);
      const info = await adminCgpaApi.getStudentCgpa(regdno);
      setCgpaInfo(info || null);
    } catch (error) {
      console.error('Error loading CGPA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await adminCgpaApi.refreshStudentCgpa(regdno);
      toast({
        title: 'Success',
        description: 'CGPA refresh started for this student.',
        variant: 'default',
      } as any);
      
      // Reload CGPA info after a brief delay
      setTimeout(() => {
        loadCgpaInfo();
      }, 2000);

      onRefresh?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh CGPA.',
        variant: 'destructive',
      } as any);
      console.error('Error refreshing CGPA:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : cgpaInfo ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current CGPA</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {typeof cgpaInfo.cgpa === 'string' 
                  ? parseFloat(cgpaInfo.cgpa).toFixed(2) 
                  : cgpaInfo.cgpa.toFixed(2)}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-blue-200 dark:border-blue-800"
            >
              {refreshing ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}
              Refresh
            </Button>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(cgpaInfo.lastUpdated).toLocaleDateString()} at{' '}
              {new Date(cgpaInfo.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-4">No CGPA data available</p>
          <Button
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
          >
            {refreshing ? (
              <Loader className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Fetch from BPUT
          </Button>
        </div>
      )}
    </Card>
  );
}
