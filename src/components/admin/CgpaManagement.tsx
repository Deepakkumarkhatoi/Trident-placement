'use client';

import { useState } from 'react';
import { adminCgpaApi } from '@/src/lib/api/admin.cgpa';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card } from '@/src/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/src/components/ui/alert-dialog';
import { RefreshCw, Loader } from 'lucide-react';
import { useToast } from '@/src/hooks/use-toast';

export default function CgpaManagement() {
  const [loading, setLoading] = useState(false);
  const [studentRegdno, setStudentRegdno] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefreshAll = async () => {
    try {
      setRefreshing(true);
      const result = await adminCgpaApi.refreshAllCgpa();
      
      if (result?.message) {
        toast({
          title: 'Success',
          description: result.message,
          variant: 'default',
        } as any);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh CGPA for all students. Please try again.',
        variant: 'destructive',
      } as any);
      console.error('Error refreshing all CGPA:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefreshSingle = async () => {
    if (!studentRegdno.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a registration number.',
        variant: 'destructive',
      } as any);
      return;
    }

    try {
      setLoading(true);
      const result = await adminCgpaApi.refreshStudentCgpa(studentRegdno);
      
      if (result?.message) {
        toast({
          title: 'Success',
          description: `CGPA refresh started for student: ${studentRegdno}`,
          variant: 'default',
        } as any);
        setStudentRegdno('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to refresh CGPA for student ${studentRegdno}. Please try again.`,
        variant: 'destructive',
      } as any);
      console.error('Error refreshing student CGPA:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          CGPA Management
        </h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Manage student CGPA fetching from BPUT. Refresh CGPA for all students or individual students.
      </p>

      <div className="space-y-4">
        {/* Refresh All */}
        <div className="border border-border rounded-lg p-4 bg-secondary/20">
          <h3 className="font-semibold text-sm mb-2">Refresh CGPA for All Students</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Fetch updated CGPAs for all students from BPUT. This runs in the background.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full"
                disabled={refreshing}
                variant="default"
              >
                {refreshing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh All CGPA
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Refresh CGPA for All Students?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will fetch updated CGPA data from BPUT for all students. The process runs in the background and may take a few minutes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRefreshAll} className="bg-primary">
                  Proceed
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Refresh Single Student */}
        <div className="border border-border rounded-lg p-4 bg-secondary/20">
          <h3 className="font-semibold text-sm mb-2">Refresh CGPA for Single Student</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Refresh CGPA for a specific student by registration number.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter registration number (e.g., 0601289127)"
              value={studentRegdno}
              onChange={(e) => setStudentRegdno(e.target.value)}
              disabled={loading}
              className="text-sm"
            />
            <Button
              onClick={handleRefreshSingle}
              disabled={loading}
              variant="outline"
              className="px-4"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
