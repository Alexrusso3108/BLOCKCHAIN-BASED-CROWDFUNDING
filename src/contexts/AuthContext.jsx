import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        // Fall back to persisted local user (for face-login which doesn't create a supabase session)
        try {
          const saved = localStorage.getItem('wecare_user');
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            setUser(null);
          }
        } catch (e) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // supabase will clear session; update local state
      setUser(null);
      localStorage.removeItem('wecare_user');
    } catch (err) {
      console.error('Sign out failed', err);
      // still clear local persisted user
      setUser(null);
      localStorage.removeItem('wecare_user');
    }
  };

  // Allow storing a local-only sign-in (used after face-recognition match)
  const signInLocal = (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('wecare_user', JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to persist local sign-in', e);
    }
  };

  const value = {
    user,
    loading,
    signOut,
    signInLocal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
