'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Development-only component to simulate authentication
 * This should be removed in production
 */
export function DevAuthHelper() {
  const { isAuthenticated, user } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const simulateLogin = () => {
    const mockUser = {
      id: 'user_123',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin' as const,
      organizationId: 'org_123',
    };

    const mockToken = 'dev_token_' + Date.now();

    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('userData', JSON.stringify(mockUser));

    // Reload to trigger auth check
    window.location.reload();
  };

  const simulateLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card
        className="w-80 shadow-lg border-2 border-yellow-400"
        style={{ backgroundColor: 'rgb(255, 255, 255)' }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Dev Auth Helper</CardTitle>
          <CardDescription className="text-xs">
            {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {user && (
            <div className="text-xs bg-gray-100 p-2 rounded mb-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          )}
          {!isAuthenticated ? (
            <Button
              onClick={simulateLogin}
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Simulate Login
            </Button>
          ) : (
            <Button
              onClick={simulateLogout}
              size="sm"
              variant="destructive"
              className="w-full"
            >
              Simulate Logout
            </Button>
          )}
          <p className="text-xs text-gray-500 mt-2">
            This helper is only visible in development mode
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
