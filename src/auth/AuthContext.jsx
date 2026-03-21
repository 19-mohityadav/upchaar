/**
 * AuthContext.jsx
 * ─────────────────────────────────────────────────
 * Single source of truth for Supabase auth session.
 * Handles: patient, doctor, clinic, medical, hospital users.
 *
 * IMPORTANT: This is the ONLY place that subscribes to
 * supabase.auth.onAuthStateChange(). All other contexts
 * (Admin, Blog, Doctor) manage their own state via
 * getSession() + direct login/logout — they do NOT
 * subscribe to onAuthStateChange to avoid race conditions.
 * ─────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase.js';

const AuthContext = createContext(null);

export const PROFILE_TYPE_DASHBOARDS = {
    patient: '/',
    doctor: '/doctor/dashboard',
    clinic: '/clinic/dashboard',
    medical: '/medical/dashboard',
    hospital: '/hospital/dashboard',
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const isRegistering = useRef(false);

    /**
     * fetchProfile — reads public.profiles with a 4s timeout.
     * Returns null if the row doesn't exist or the query times out.
     */
    const fetchProfile = useCallback(async (userId) => {
        if (!userId) return null;
        try {
            const { data, error } = await Promise.race([
                supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
                new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000)),
            ]);
            if (error) { console.warn('[Auth] fetchProfile error:', error.message); return null; }
            return data ?? null;
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        // ── Initial session restore ───────────────────────────────────
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            const u = session?.user ?? null;
            setUser(u);
            // ⚡ Unblock the app immediately — profile loads in background
            if (mounted) setLoading(false);
            if (u) {
                fetchProfile(u.id).then(p => { if (mounted) setProfile(p); });
            }
        }).catch(() => { if (mounted) setLoading(false); });

        // ── Auth state changes ─────────────────────────────────────────
        // ONLY this context subscribes to onAuthStateChange.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (!mounted) return;
                console.log('[Auth] event:', event);

                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                    const u = session?.user ?? null;
                    setUser(u);
                    // ⚡ Never block loading on profile fetch
                    setLoading(false);
                    if (u && !isRegistering.current) {
                        // Fetch profile in background — doesn't block anything
                        fetchProfile(u.id).then(p => { if (mounted) setProfile(p); });
                    }
                }
            }
        );

        return () => { mounted = false; subscription.unsubscribe(); };
    }, [fetchProfile]);

    /** signIn — for patients/doctors/etc. via unified login */
    const signIn = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(), password,
        });
        if (error) {
            throw new Error(
                error.message.toLowerCase().includes('invalid login credentials')
                    ? 'Incorrect email or password.'
                    : error.message
            );
        }
        const p = await fetchProfile(data.user.id);
        if (!p) {
            await supabase.auth.signOut();
            throw new Error('No profile found. Please register first.');
        }
        if (p.status === 'suspended') {
            await supabase.auth.signOut();
            throw new Error('Your account has been suspended. Contact support.');
        }
        setUser(data.user);
        setProfile(p);
        return { user: data.user, profile: p };
    }, [fetchProfile]);

    /** signUp — creates auth user + profile via DB trigger */
    const signUp = useCallback(async ({ fullName, email, phone, password, profileType }) => {
        isRegistering.current = true;
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: {
                        full_name: fullName.trim(),
                        phone: phone?.trim() || '',
                        profile_type: profileType,
                    },
                },
            });
            if (error) {
                throw new Error(
                    error.message.toLowerCase().includes('already registered')
                        ? 'An account with this email already exists.'
                        : error.message
                );
            }
            const userId = data.user?.id;
            if (!userId) throw new Error('Registration failed. Please try again.');

            // Wait for DB trigger to create the profile (faster polling)
            let p = null;
            for (let i = 1; i <= 8; i++) {
                p = await fetchProfile(userId);
                if (p) break;
                await new Promise(r => setTimeout(r, 250));
            }

            // Seed controllers table for admin roles
            if (['blogger', 'support_admin', 'super_admin'].includes(profileType)) {
                await supabase.from('controllers').insert({
                    id: userId,
                    name: fullName.trim(),
                    email: email.trim(),
                    role: profileType,
                    status: 'active',
                }).select().maybeSingle();
            }

            // Sign out so user must log in manually
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            setLoading(false);
            isRegistering.current = false;
            return { success: true };
        } catch (err) {
            isRegistering.current = false;
            setLoading(false);
            await supabase.auth.signOut().catch(() => { });
            throw err;
        }
    }, [fetchProfile]);

    /** signOut */
    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    }, []);

    const getDashboardPath = useCallback((p) => {
        return PROFILE_TYPE_DASHBOARDS[p?.profile_type] || '/';
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, getDashboardPath }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
