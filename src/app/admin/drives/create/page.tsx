'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminDrivesApi } from '@/src/lib/api/admin.drives';

export default function CreateDrivePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    driveType: 'ON_CAMPUS',
    lpaPackage: '',
    minimumCgpa: '',
    lastDate: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.companyName.trim() || !formData.role.trim() ||
        !formData.lpaPackage || !formData.minimumCgpa || !formData.lastDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await adminDrivesApi.create({
        companyName:  formData.companyName.trim(),
        role:         formData.role.trim(),
        driveType:    formData.driveType,
        lpaPackage:   parseFloat(formData.lpaPackage),
        minimumCgpa:  parseFloat(formData.minimumCgpa),
        lastDate:     formData.lastDate,
        description:  formData.description.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push('/admin/drives'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create drive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/drives">
        <Button variant="outline" className="gap-2 mb-4"><ArrowLeft className="w-4 h-4" />Back to Drives</Button>
      </Link>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Create New Drive</CardTitle></CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-800 mt-1">{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">Drive created successfully! Redirecting...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company Name <span className="text-red-500">*</span></label>
              <Input name="companyName" value={formData.companyName} onChange={handleChange}
                placeholder="Enter company name" disabled={loading || success} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Role <span className="text-red-500">*</span></label>
              <Input name="role" value={formData.role} onChange={handleChange}
                placeholder="e.g. Software Engineer" disabled={loading || success} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Drive Type <span className="text-red-500">*</span></label>
                <Select value={formData.driveType}
                  onValueChange={v => handleChange({ target: { name: 'driveType', value: v } })}
                  disabled={loading || success}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ON_CAMPUS">On Campus</SelectItem>
                    <SelectItem value="OFF_CAMPUS">Off Campus</SelectItem>
                    <SelectItem value="POOL">Virtual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Package (LPA) <span className="text-red-500">*</span></label>
                <Input name="lpaPackage" type="number" step="0.1" value={formData.lpaPackage}
                  onChange={handleChange} placeholder="e.g. 12.5" disabled={loading || success} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Minimum CGPA <span className="text-red-500">*</span></label>
                <Input name="minimumCgpa" type="number" step="0.1" value={formData.minimumCgpa}
                  onChange={handleChange} placeholder="e.g. 7.0" disabled={loading || success} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Last Date <span className="text-red-500">*</span></label>
                <Input name="lastDate" type="date" value={formData.lastDate}
                  onChange={handleChange} disabled={loading || success} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <Textarea name="description" value={formData.description} onChange={handleChange}
                placeholder="Enter job description, requirements, etc." rows={6} disabled={loading || success} />
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || success} className="flex-1">
                {loading ? 'Creating...' : success ? 'Created!' : 'Create Drive'}
              </Button>
              <Link href="/admin/drives" className="flex-1">
                <Button type="button" variant="outline" className="w-full" disabled={loading || success}>Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}