/**
 * AuthContext.jsx
 * ─────────────────────────────────────────────────
 * Unified authentication context for all profile-based
 * users: patient, doctor, clinic, medical, hospital.
 *
 * Uses Supabase Auth for authentication and reads the
 * `public.profiles` table to get the user's profile_type.
 *
 * After login, the user's profile_type determines which
 * dashboard they are redirected to:
 *
 *   patient   → /  (Landing page)
 *   doctor    → /doctor/dashboard
 *   clinic    → /clinic/dashboard  (future)
 *   medical   → /medical/dashboard (future)
 *   hospital  → /hospital/dashboard (future)
 *
 * Exposed via useAuth():
 *   user         → Supabase auth user object (or null)
 *   profile      → public.profiles row (null if not logged in)
 *   loading      → true while session is being restored
 *   signIn(email, password) → signs in + fetches profile
 *   signUp(data)            → creates auth user + profile row, then signs out
 *                             Returns { success: true } — caller redirects to /login
 *   signOut()               → clears session
 * ─────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase.js';

const AuthContext = createContext(null);

/**
 * PROFILE_TYPE_DASHBOARDS
 * Maps each profile_type to its dashboard route.
 * Add new types here as new portals are built.
 */
export const PROFILE_TYPE_DASHBOARDS = {
    patient: '/',                      // Patients land on the main Landing page
    doctor: '/doctor/dashboard',
    clinic: '/clinic/dashboard',
    medical: '/medical/dashboard',
    hospital: '/hospital/dashboard',
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);       // Supabase auth user
    const [profile, setProfile] = useState(null); // public.profiles row
    const [loading, setLoading] = useState(true);

    // Ref to skip auth listener updates during manual signup flow
    const isRegistering = useRef(false);

    /**
     * fetchProfile
     * Looks up the user's row in public.profiles.
     * Returns null if the row doesn't exist yet.
     */
    const fetchProfile = useCallback(async (userId) => {
        console.log('[AuthContext] fetchProfile start for:', userId);
        if (!userId) return null;
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        if (error) {
            console.warn('[AuthContext] fetchProfile:', error.message);
            return null;
        }
        return data;
    }, []);

    /**
     * On mount: restore Supabase session and load profile.
     * Subscribes to auth changes (login / logout in other tabs).
     */
    useEffect(() => {
        let mounted = true;

        // ── Initial session restore ───────────────────────────────────
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!mounted) return;
            setUser(session?.user ?? null);
            if (session?.user) {
                const p = await fetchProfile(session.user.id);
                if (mounted) setProfile(p);
            }
            if (mounted) setLoading(false);
        }).catch(() => {
            if (mounted) setLoading(false);
        });

        // ── Auth state change ────────────────────────────────────────
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[AuthContext] onAuthStateChange event:', event);
                if (!mounted) return;

                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        // If we are in the middle of a signUp() insert, don't let the listener
                        // fetch an incomplete profile and potentially trigger redirects.
                        if (isRegistering.current) {
                            console.log('[AuthContext] Listener: signup in progress, skipping profile fetch');
                            return;
                        }

                        const p = await fetchProfile(session.user.id);
                        console.log('[AuthContext] onAuthStateChange profile result:', !!p);
                        if (mounted) { setProfile(p); setLoading(false); }
                    } else {
                        if (mounted) setLoading(false);
                    }
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    /**
     * signIn
     * Signs in with email + password via Supabase Auth.
     * Checks that the user exists in public.profiles.
     * Returns the { user, profile } so the caller can decide where to redirect.
     *
     * @param {string} email
     * @param {string} password
     * @returns {{ user, profile }} — auth user + profiles row
     * @throws Error with user-friendly message
     */
    const signIn = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (error) {
            if (error.message.toLowerCase().includes('invalid login credentials')) {
                throw new Error('Incorrect email or password. Please try again.');
            }
            throw new Error(error.message);
        }

        // ── DB check: user must exist in public.profiles ─────────────
        const p = await fetchProfile(data.user.id);
        if (!p) {
            await supabase.auth.signOut();
            throw new Error('No profile found for this account. Please register first.');
        }

        // ── Authorization: check account status ──────────────────────
        if (p.status === 'suspended') {
            await supabase.auth.signOut();
            throw new Error('Your account has been suspended. Please contact support.');
        }

        // ── Session is now active (stored in cookie) ─────────────────
        setUser(data.user);
        setProfile(p);
        return { user: data.user, profile: p };
    }, [fetchProfile]);

    /**
     * signUp
     * Registers a new user. Steps:
     *  1. Creates a Supabase Auth user (triggers the DB trigger `handle_new_auth_user`
     *     which auto-inserts into public.profiles — no client-side INSERT needed)
     *  2. Waits for the trigger-created profile to appear (up to 3 retries)
     *  3. Seeds role-specific tables (doctors, controllers) if needed
     *  4. Signs the user OUT — they must explicitly sign in
     *
     * Returns { success: true } so the caller can redirect to /login.
     *
     * @param {object} params
     * @param {string} params.fullName
     * @param {string} params.email
     * @param {string} params.phone
     * @param {string} params.password
     * @param {string} params.profileType - 'patient' | 'doctor' | 'clinic' | 'medical' | 'hospital'
     * @returns {{ success: true }}
     */
    const signUp = useCallback(async ({ fullName, email, phone, password, profileType }) => {
        console.log('[AuthContext] signUp start:', email, profileType);
        isRegistering.current = true;
        try {
            // Step 1: create Supabase Auth user
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

            console.log('[AuthContext] auth.signUp result:', { hasUser: !!data.user, error: error?.message });

            if (error) {
                if (error.message.toLowerCase().includes('already registered')) {
                    throw new Error('An account with this email already exists. Please sign in.');
                }
                throw new Error(error.message);
            }

            const userId = data.user?.id;
            if (!userId) throw new Error('Registration failed. Please try again.');

            // Step 2: Wait for the DB trigger (handle_new_auth_user) to create the profile.
            //         The trigger runs SECURITY DEFINER server-side, so no RLS issue.
            //         We poll up to 3 times with a 800ms delay.
            console.log('[AuthContext] Waiting for trigger to create profile for:', userId);
            let p = null;
            for (let attempt = 1; attempt <= 3; attempt++) {
                await new Promise(r => setTimeout(r, 800));
                p = await fetchProfile(userId);
                if (p) break;
                console.log(`[AuthContext] Profile not ready yet, attempt ${attempt}/3`);
            }

            if (!p) {
                console.error('[AuthContext] Profile not created by trigger after retries');
                throw new Error('Account created but profile setup failed. Please try signing in — your profile may still be processing.');
            }
            console.log('[AuthContext] profile confirmed from trigger:', !!p);

            // Step 3: controllers seeding for admin/blogger roles
            //         (profiles + doctors are handled by the DB trigger `handle_new_auth_user`)
            if (['blogger', 'support_admin', 'super_admin'].includes(profileType)) {
                const { error: controllerError } = await supabase
                    .from('controllers')
                    .insert({
                        id: userId,
                        name: fullName.trim(),
                        email: email.trim(),
                        role: profileType,
                        status: 'active',
                    });
                if (controllerError) {
                    console.error('[AuthContext] Controller insert error:', controllerError.message);
                }
            }

            // Step 4: Sign the user out so they must explicitly sign in.
            //         This prevents an auto-login after registration.
            await supabase.auth.signOut();

            // Keep local state clean — the user is NOT logged in yet.
            setUser(null);
            setProfile(null);
            setLoading(false);
            isRegistering.current = false;

            return { success: true };
        } catch (err) {
            isRegistering.current = false;
            setLoading(false);
            // Clean up any partial Supabase session
            await supabase.auth.signOut().catch(() => { });
            throw err;
        }
    }, []);

    /**
     * signOut
     * Signs the user out of Supabase and clears local state.
     */
    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    }, []);

    /**
     * getDashboardPath
     * Returns the correct dashboard path based on profile_type.
     * Falls back to '/' if the type is unknown.
     *
     * @param {object} p - profile row
     */
    const getDashboardPath = useCallback((p) => {
        return PROFILE_TYPE_DASHBOARDS[p?.profile_type] || '/';
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            signIn,
            signUp,
            signOut,
            getDashboardPath,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth
 * Hook to access the shared AuthContext.
 * Must be inside <AuthProvider>.
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
