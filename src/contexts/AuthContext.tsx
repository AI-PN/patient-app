'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabaseClient';

interface PatientProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: PatientProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    data: { user: User | null; session: Session | null } | null;
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signIn: async () => ({ error: null, data: null }),
  signOut: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // First try to get the patient profile linked to this user
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (patientError && patientError.code !== 'PGRST116') {
        console.error('Error fetching patient profile:', patientError);
      }

      if (patientData) {
        // Get the initials from the name
        const initials = patientData.name
          .split(' ')
          .map((part: string) => part[0])
          .join('')
          .toUpperCase();

        setProfile({
          id: patientData.patient_id,
          name: patientData.name,
          email: patientData.email || user?.email || '',
          initials,
          avatarUrl: patientData.avatar_url,
        });
        return;
      }

      // If no patient profile, just use basic user info
      if (user) {
        const email = user.email || '';
        const name = email.split('@')[0] || 'Patient';
        const initials = name.substring(0, 2).toUpperCase();

        setProfile({
          id: user.id,
          name,
          email,
          initials,
          avatarUrl: null,
        });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    return response;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/login');
  };

  // Handle redirects based on authentication status
  useEffect(() => {
    // Skip during server-side rendering or while loading
    if (isLoading) return;

    const isAuthRoute = pathname === '/login';

    if (!user && !isAuthRoute) {
      // If not authenticated and not on an auth route, redirect to login
      router.push('/login');
    } else if (user && isAuthRoute) {
      // If authenticated and on an auth route, redirect to dashboard
      router.push('/');
    }
  }, [user, pathname, isLoading, router]);

  const value = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 