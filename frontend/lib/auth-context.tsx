'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'viewer';
  organizationId: string;
  profilePictureUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  // Fetch user profile data from users table
  const fetchUserProfile = React.useCallback(async (authUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('[fetchUserProfile] Fetching profile for user:', authUser.id);

      // Add timeout to prevent infinite hanging
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout after 5 seconds')), 5000)
      );

      const fetchPromise = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('id', authUser.id)
        .maybeSingle();

      // Race between fetch and timeout
      let { data, error, count } = await Promise.race([fetchPromise, timeout]) as any;

      // Detailed error logging
      if (error) {
        console.error('[fetchUserProfile] Supabase error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // If it's a PGRST116 error (0 rows), the profile doesn't exist
        if (error.code === 'PGRST116') {
          console.warn('[fetchUserProfile] User profile not found - likely missing trigger or RLS issue');
          console.warn('[fetchUserProfile] Signing out to prevent infinite loading');
          return null;
        } else {
          // Other error - return null
          console.error('[fetchUserProfile] Returning null due to error');
          return null;
        }
      }

      // Check if we actually got data
      if (!data) {
        console.error('[fetchUserProfile] No data returned. Row count:', count);
        console.error('[fetchUserProfile] RLS policy or missing profile - signing out');
        return null;
      }

      console.log('[fetchUserProfile] Profile fetched successfully:', {
        id: data.id,
        email: data.email,
        role: data.role,
        organizationId: data.organization_id,
      });

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        organizationId: data.organization_id,
        profilePictureUrl: data.profile_picture_url,
      };
    } catch (err) {
      console.error('[fetchUserProfile] Unexpected error:', err);
      return null;
    }
  }, [supabase]);

  // Check for existing session on mount
  useEffect(() => {
    let isMounted = true; // Prevent state updates after unmount
    let isSigningOut = false; // Prevent infinite sign-out loops

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (!isMounted) return; // Component unmounted, abort

        if (sessionError) {
          console.error('[Auth] Session error:', sessionError);
          // Clear invalid session
          await supabase.auth.signOut();
          setUser(null);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('[Auth] Session found, fetching profile for:', session.user.id);
          const userProfile = await fetchUserProfile(session.user);
          if (!isMounted) return; // Component unmounted during fetch

          if (userProfile) {
            setUser(userProfile);
          } else {
            console.error('[Auth] Profile not found for user, signing out');
            isSigningOut = true;
            await supabase.auth.signOut();
            setUser(null);
            router.push('/login');
          }
        } else {
          console.log('[Auth] No session found');
        }
      } catch (error) {
        if (!isMounted) return; // Component unmounted during error
        console.error('[Auth] Auth check failed:', error);
        // Clear session on any error
        await supabase.auth.signOut();
        setUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return; // Component unmounted
      if (isSigningOut) return; // Already signing out, prevent loop

      console.log('[Auth] Auth state changed:', event);
      if (session?.user) {
        // Skip profile fetch on auth callback page - it handles its own flow
        const isAuthCallback = typeof window !== 'undefined' && window.location.pathname === '/auth/callback';
        if (isAuthCallback) {
          console.log('[Auth] On auth callback page, skipping profile fetch');
          setIsLoading(false);
          return;
        }

        const userProfile = await fetchUserProfile(session.user);
        if (!isMounted) return; // Component unmounted during fetch

        if (userProfile) {
          setUser(userProfile);
        } else {
          console.error('[Auth] Failed to fetch user profile, signing out');
          setUser(null);
          isSigningOut = true; // Set flag before signing out
          await supabase.auth.signOut();
          router.push('/login'); // Redirect to login
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false; // Mark as unmounted
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]); // Only depend on supabase, not fetchUserProfile

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      console.log('[login] Attempting to sign in with:', email, 'Remember me:', rememberMe);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[login] Sign in error:', error);
        throw error;
      }

      if (data.user) {
        console.log('[login] Sign in successful, fetching profile for:', data.user.id);
        const userProfile = await fetchUserProfile(data.user);
        if (userProfile) {
          console.log('[login] Profile fetched, redirecting to /widgets');
          setUser(userProfile);

          // For remember me, Supabase already persists session in cookies
          // The default session duration is controlled by JWT expiry (server-side)
          // Client-side, we use localStorage vs sessionStorage for extended persistence
          if (rememberMe) {
            // Session persists across browser restarts (default with @supabase/ssr)
            console.log('[login] Remember me enabled - session will persist');
          } else {
            // For non-remember-me, session still persists but could be shorter
            console.log('[login] Remember me disabled - using default session duration');
          }

          router.push('/widgets');
        } else {
          console.error('[login] Failed to fetch profile after login');
          throw new Error('Failed to load user profile. Please contact support.');
        }
      }
    } catch (error) {
      console.error('[login] Login error:', error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      // Sign up with Supabase Auth
      // The database trigger will automatically create the organization and user profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Check if email confirmation is required
      if (authData.session) {
        // User is auto-logged in (email confirmation disabled)
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        const userProfile = await fetchUserProfile(authData.user);
        setUser(userProfile);
        router.push('/widgets');
      } else {
        // Email confirmation required
        throw new Error('Please check your email to confirm your account before signing in');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
