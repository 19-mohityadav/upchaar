/**
 * AdminContext.jsx
 * ─────────────────────────────────────────────────
 * Admin portal authentication and session management.
 * Uses Supabase Auth + the `controllers` table for role verification.
 * Supports: super_admin, support_admin
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase.js';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Fetch controller row (admin role) from DB ─────────────────────────────
    const fetchController = useCallback(async (userId) => {
        if (!userId) return null;
        const { data, error } = await supabase
            .from('controllers')
            .select('*')
            .eq('id', userId)
            .in('role', ['super_admin', 'support_admin'])
            .maybeSingle();
        if (error) {
            console.warn('[AdminContext] fetchController:', error.message);
            return null;
        }
        return data;
    }, []);

    // ── Session restore on mount ──────────────────────────────────────────────
    useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!mounted) return;
            if (session?.user) {
                const ctrl = await fetchController(session.user.id);
                if (mounted) setAdmin(ctrl ? { ...ctrl, email: session.user.email } : null);
            }
            if (mounted) setLoading(false);
        }).catch(() => {
            if (mounted) setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            if (event === 'SIGNED_OUT') {
                setAdmin(null);
                setLoading(false);
                return;
            }
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                if (session?.user) {
                    const ctrl = await fetchController(session.user.id);
                    if (mounted) setAdmin(ctrl ? { ...ctrl, email: session.user.email } : null);
                }
                if (mounted) setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchController]);

    // ── Login ─────────────────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (error) {
            if (error.message.toLowerCase().includes('invalid login credentials')) {
                throw new Error('Invalid email or password. Please try again.');
            }
            throw new Error(error.message);
        }

        // Verify this user is an admin (not a patient/doctor)
        const ctrl = await fetchController(data.user.id);
        if (!ctrl) {
            await supabase.auth.signOut();
            throw new Error('This account does not have admin access.');
        }

        if (ctrl.status === 'suspended') {
            await supabase.auth.signOut();
            throw new Error('This admin account has been suspended.');
        }

        const adminSession = { ...ctrl, email: data.user.email };
        setAdmin(adminSession);
        return adminSession;
    }, [fetchController]);

    // ── Logout ────────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setAdmin(null);
    }, []);

    const isSuperAdmin = admin?.role === 'super_admin';

    return (
        <AdminContext.Provider value={{ admin, login, logout, isSuperAdmin, loading }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
    return ctx;
}
