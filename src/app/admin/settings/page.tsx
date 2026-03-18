'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Switch } from '@/src/components/ui/switch';
import { AlertCircle, Save } from 'lucide-react';
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string | boolean } }
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? !prev[name as keyof typeof formData] : value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Save settings to backend
      console.log('Settings saved:', formData);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage system configuration and preferences</p>
      </div>

      {settingsSaved && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">System Name</label>
              <Input
                name="systemName"
                value={formData.systemName}
                onChange={handleChange}
                placeholder="Enter system name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Admin Email</label>
              <Input
                name="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={handleChange}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Support Email</label>
              <Input
                name="supportEmail"
                type="email"
                value={formData.supportEmail}
                onChange={handleChange}
                placeholder="support@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Application Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Applications Per Student
              </label>
              <Input
                name="maxApplicationsPerStudent"
                type="number"
                value={formData.maxApplicationsPerStudent}
                onChange={handleChange}
                min="1"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <label className="text-sm font-medium text-foreground">Enable Auto Approval</label>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatically approve applications meeting criteria
                </p>
              </div>
              <Switch
                checked={formData.autoApprovalEnabled}
                onCheckedChange={(checked) => handleSwitchChange('autoApprovalEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">Enable Notifications</label>
                <p className="text-xs text-muted-foreground mt-1">
                  Send email notifications for important events
                </p>
              </div>
              <Switch
                checked={formData.notificationsEnabled}
                onCheckedChange={(checked) => handleSwitchChange('notificationsEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
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

        {/* Save Button */}
        <Button type="submit" size="lg" className="w-full gap-2">
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </form>
    </div>
  );
}
