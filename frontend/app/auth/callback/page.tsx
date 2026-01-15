'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

type CallbackState = 'loading' | 'success' | 'error' | 'missing_code';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<CallbackState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      // Check if user is already authenticated (handles PKCE errors when link opens in different tab)
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession?.user) {
        console.log('[Auth Callback] User already authenticated, redirecting...');
        setState('success');
        setTimeout(() => router.push('/widgets'), 2500);
        return;
      }

      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        console.error('[Auth Callback] Error from Supabase:', error, errorDescription);
        setState('error');
        setErrorMessage(
          errorDescription ||
          'Authentication failed. Please try again or contact support.'
        );
        return;
      }

      if (!code) {
        console.error('[Auth Callback] No code found in URL');
        setState('missing_code');
        setErrorMessage('No authentication code found. The link may be invalid or expired.');
        return;
      }

      try {
        console.log('[Auth Callback] Exchanging code for session...');
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error('[Auth Callback] Code exchange failed:', exchangeError);

          // Handle PKCE error - check if user is already authenticated (session in cookies)
          if (exchangeError.message.includes('PKCE') || exchangeError.message.includes('code verifier')) {
            // Wait a moment for auth state to sync, then check session
            await new Promise(resolve => setTimeout(resolve, 500));
            const { data: { session: sessionAfterError } } = await supabase.auth.getSession();

            if (sessionAfterError?.user) {
              console.log('[Auth Callback] PKCE error but user is authenticated, redirecting...');
              setState('success');
              setTimeout(() => router.push('/widgets'), 2500);
              return;
            }

            // No session - show login prompt
            setState('error');
            setErrorMessage('Email confirmed! Please log in with your email and password to continue.');
            return;
          }

          setState('error');
          if (exchangeError.message.includes('expired')) {
            setErrorMessage('This confirmation link has expired. Please request a new one.');
          } else if (exchangeError.message.includes('invalid')) {
            setErrorMessage('This confirmation link is invalid. Please try signing up again.');
          } else {
            setErrorMessage(
              exchangeError.message ||
              'Failed to verify your email. Please try again or contact support.'
            );
          }
          return;
        }

        if (!data.session) {
          console.error('[Auth Callback] No session returned after code exchange');
          setState('error');
          setErrorMessage('Failed to create session. Please try logging in manually.');
          return;
        }

        console.log('[Auth Callback] Email confirmed successfully');

        // Wait for user profile to be created by the database trigger
        // Retry up to 5 times with 1 second delay between attempts
        let profileExists = false;
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile) {
            profileExists = true;
            console.log('[Auth Callback] Profile found, redirecting...');
            break;
          }
          console.log(`[Auth Callback] Profile not found yet, attempt ${i + 1}/5`);
        }

        if (!profileExists) {
          console.error('[Auth Callback] Profile was not created after 5 attempts');
          setState('error');
          setErrorMessage('Your account was confirmed but profile creation is pending. Please try logging in.');
          return;
        }

        setState('success');
        setTimeout(() => {
          router.push('/widgets');
        }, 2500);

      } catch (error) {
        console.error('[Auth Callback] Unexpected error:', error);
        setState('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {state === 'loading' && 'Confirming Your Email'}
            {state === 'success' && 'Email Confirmed!'}
            {state === 'error' && 'Confirmation Failed'}
            {state === 'missing_code' && 'Invalid Link'}
          </CardTitle>
          <CardDescription className="text-center">
            {state === 'loading' && 'Please wait while we verify your email address...'}
            {state === 'success' && 'Your email has been successfully verified'}
            {(state === 'error' || state === 'missing_code') && 'We encountered a problem'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-4">
          {state === 'loading' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verifying your email...</p>
            </div>
          )}

          {state === 'success' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your account has been confirmed. Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            </div>
          )}

          {(state === 'error' || state === 'missing_code') && (
            <div className="flex flex-col items-center space-y-4 py-8 w-full">
              {state === 'error' ? (
                <XCircle className="h-16 w-16 text-red-500" />
              ) : (
                <AlertTriangle className="h-16 w-16 text-orange-500" />
              )}

              <Alert variant="destructive" className="w-full">
                <XCircle className="h-4 w-4" />
                <AlertTitle>
                  {state === 'error' ? 'Verification Failed' : 'Invalid Link'}
                </AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/login">Go to Login</Link>
                </Button>
                <Button asChild className="flex-1 text-white">
                  <Link href="/register">Sign Up Again</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
