'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AuthBrandPanel } from '@/components/auth/auth-brand-panel';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // TODO: Replace with actual API call to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reset email');
      }

      setSubmittedEmail(data.email);
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
    }
  };

  // Success state - full page with split-screen
  if (emailSent) {
    return (
      <div className="min-h-screen flex animate-in fade-in-0 duration-500">
        {/* Left: Brand Panel - Hidden on mobile */}
        <AuthBrandPanel />

        {/* Right: Success Message */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 bg-background">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-2xl font-bold text-primary">ChatForge</h1>
              <p className="text-sm text-muted-foreground mt-1">
                AI-Powered Chat Widgets
              </p>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1 text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  Check your email
                </CardTitle>
                <CardDescription>
                  We&apos;ve sent password reset instructions to{' '}
                  <strong className="text-foreground">{submittedEmail}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  If you don&apos;t see the email, check your spam folder or try again with a different email address.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pb-6">
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full h-11">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Form state - split-screen layout
  return (
    <div className="min-h-screen flex animate-in fade-in-0 duration-500">
      {/* Left: Brand Panel - Hidden on mobile */}
      <AuthBrandPanel />

      {/* Right: Form Panel */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-bold text-primary">ChatForge</h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-Powered Chat Widgets
            </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Forgot Password?
              </CardTitle>
              <CardDescription>
                Enter your email address and we&apos;ll send you instructions to reset your password
              </CardDescription>
            </CardHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pb-6">
                  <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Instructions'
                    )}
                  </Button>

                  <Link href="/login" className="w-full">
                    <Button variant="ghost" className="w-full h-11">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Sign In
                    </Button>
                  </Link>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
