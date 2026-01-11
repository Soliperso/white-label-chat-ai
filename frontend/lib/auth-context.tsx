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
  login: (email: string, password: string) => Promise<void>;
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

      // First try to get the user profile
      let { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('id', authUser.id)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid throwing on 0 rows

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
          console.warn('[fetchUserProfile] User profile not found in database. This might mean:');
          console.warn('  1. The user was just created and the trigger hasn\'t finished');
          console.warn('  2. The RLS policies are blocking access');
          console.warn('  3. The user row was deleted from the users table');
          console.warn('  Waiting 2 seconds and retrying...');

          // Wait a bit for the trigger to complete
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Retry once
          const retryResult = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          if (retryResult.error || !retryResult.data) {
            console.error('[fetchUserProfile] Retry failed:', retryResult.error);
            return null;
          }

          console.log('[fetchUserProfile] Retry successful!');
          data = retryResult.data;
        } else {
          // Other error - return null
          return null;
        }
      }

      // Check if we actually got data
      if (!data) {
        console.error('[fetchUserProfile] No data returned. Row count:', count);
        console.error('[fetchUserProfile] This indicates an RLS policy issue or missing user profile.');
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
            await supabase.auth.signOut();
            setUser(null);
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

      console.log('[Auth] Auth state changed:', event);
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user);
        if (!isMounted) return; // Component unmounted during fetch

        if (userProfile) {
          setUser(userProfile);
        } else {
          console.error('[Auth] Failed to fetch user profile, signing out');
          setUser(null);
          await supabase.auth.signOut();
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

  const login = async (email: string, password: string) => {
    try {
      console.log('[login] Attempting to sign in with:', email);
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
