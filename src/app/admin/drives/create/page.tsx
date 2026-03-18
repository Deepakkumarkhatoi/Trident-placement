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
import { BACKEND_URL, API_ENDPOINTS } from '@/src/lib/backend';

export default function CreateDrivePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    type: 'ON_CAMPUS',
    lpa: '',
    cgpa: '',
    lastDate: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!formData.company.trim() || !formData.role.trim() || !formData.lpa.trim() || !formData.cgpa.trim() || !formData.lastDate.trim()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      console.log('[v0] Sending drive creation request:', formData);
      
      const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.ADMIN_DRIVES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
        body: JSON.stringify({
          companyName: formData.company,
          position: formData.role,
          driveType: formData.type,
          packageLPA: parseFloat(formData.lpa),
          minCGPA: parseFloat(formData.cgpa),
          applicationDeadline: formData.lastDate,
          description: formData.description || '',
        }),
      });

      console.log('[v0] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('[v0] Error response:', errorData);
        throw new Error(errorData.message || `Failed to create drive (${response.status})`);
      }

      const data = await response.json();
      console.log('[v0] Drive created successfully:', data);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/admin/drives');
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred while creating the drive';
      console.error('[v0] Error creating drive:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/drives">
        <Button variant="outline" className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Drives
        </Button>
      </Link>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create New Drive</CardTitle>
        </CardHeader>
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
              <div>
                <p className="text-sm font-medium text-green-900">Success</p>
                <p className="text-sm text-green-800 mt-1">Drive created successfully! Redirecting...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company Name <span className="text-red-500">*</span></label>
              <Input
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter company name"
                disabled={loading || success}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Position/Role <span className="text-red-500">*</span></label>
              <Input
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g., Software Engineer"
                disabled={loading || success}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Drive Type <span className="text-red-500">*</span></label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleChange({ target: { name: 'type', value } })}
                  disabled={loading || success}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ON_CAMPUS">On Campus</SelectItem>
                    <SelectItem value="OFF_CAMPUS">Off Campus</SelectItem>
                    <SelectItem value="POOL">Pool</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Package (LPA) <span className="text-red-500">*</span></label>
                <Input
                  name="lpa"
                  type="number"
                  step="0.1"
                  value={formData.lpa}
                  onChange={handleChange}
                  placeholder="e.g., 12.5"
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Minimum CGPA <span className="text-red-500">*</span></label>
                <Input
                  name="cgpa"
                  type="number"
                  step="0.1"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="e.g., 7.0"
                  disabled={loading || success}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Application Deadline <span className="text-red-500">*</span></label>
                <Input
                  name="lastDate"
                  type="date"
                  value={formData.lastDate}
                  onChange={handleChange}
                  disabled={loading || success}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter job description, requirements, etc."
                rows={6}
                disabled={loading || success}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={loading || success} 
                className="flex-1"
              >
                {loading ? 'Creating...' : success ? 'Created Successfully!' : 'Create Drive'}
              </Button>
              <Link href="/admin/drives" className="flex-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  disabled={loading || success}
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
