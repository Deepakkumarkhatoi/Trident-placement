'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Switch } from '@/src/components/ui/switch';
import { CheckCircle2, Save } from 'lucide-react'; // ← was AlertCircle
import { Alert, AlertDescription } from '@/src/components/ui/alert';

export default function SettingsPage() {
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [formData, setFormData] = useState({
    systemName: 'Placement Management System',
    adminEmail: 'admin@university.edu',
    supportEmail: 'support@university.edu',
    notificationsEnabled: true,
    autoApprovalEnabled: false,
    maxApplicationsPerStudent: 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Note: no backend endpoint exists for settings yet — frontend only
    console.log('Settings (frontend only):', formData);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage system configuration and preferences</p>
      </div>

      {settingsSaved && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" /> {/* ← fixed icon */}
          <AlertDescription className="text-green-800">Settings saved (frontend only — no backend endpoint yet).</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'System Name',    name: 'systemName',    type: 'text',  placeholder: 'Enter system name' },
              { label: 'Admin Email',    name: 'adminEmail',    type: 'email', placeholder: 'admin@example.com' },
              { label: 'Support Email',  name: 'supportEmail',  type: 'email', placeholder: 'support@example.com' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-foreground mb-2">{f.label}</label>
                <Input name={f.name} type={f.type}
                  value={formData[f.name as keyof typeof formData] as string}
                  onChange={handleChange} placeholder={f.placeholder} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Application Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Max Applications Per Student</label>
              <Input name="maxApplicationsPerStudent" type="number"
                value={formData.maxApplicationsPerStudent} onChange={handleChange} min="1" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <label className="text-sm font-medium text-foreground">Enable Auto Approval</label>
                <p className="text-xs text-muted-foreground mt-1">Automatically approve applications meeting criteria</p>
              </div>
              <Switch checked={formData.autoApprovalEnabled}
                onCheckedChange={c => handleSwitchChange('autoApprovalEnabled', c)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">Enable Notifications</label>
                <p className="text-xs text-muted-foreground mt-1">Send email notifications for important events</p>
              </div>
              <Switch checked={formData.notificationsEnabled}
                onCheckedChange={c => handleSwitchChange('notificationsEnabled', c)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>System Information</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">System Version</span>
              <span className="font-medium text-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium text-foreground">{new Date().toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full gap-2">
          <Save className="w-4 h-4" />Save Settings
        </Button>
      </form>
    </div>
  );
}