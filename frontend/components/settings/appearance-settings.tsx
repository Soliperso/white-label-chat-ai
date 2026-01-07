'use client';

import { useState } from 'react';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function AppearanceSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Appearance settings updated');
    setIsLoading(false);
  };

  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      description: 'Light theme for daytime use',
      icon: Sun,
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Dark theme for reduced eye strain',
      icon: Moon,
    },
    {
      value: 'system',
      label: 'System',
      description: 'Follows your system preference',
      icon: Monitor,
    },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose your preferred theme for the dashboard
            </p>
          </div>

          <Separator />

          <div className="grid gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className={`relative flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                    theme === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setTheme(option.value)}
                >
                  <div className={`p-2 rounded-lg ${
                    theme === option.value ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      theme === option.value ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <Label className="cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                  {theme === option.value && (
                    <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Dashboard Density</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Adjust the spacing and density of dashboard elements
            </p>
          </div>

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p>This feature is coming soon. Stay tuned for updates!</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="text-white">
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
