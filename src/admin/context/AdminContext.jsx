/**
 * AdminContext.jsx
 * ─────────────────────────────────────────────────
 * Admin portal authentication — super_admin & support_admin.
 *
 * ⚠️  Does NOT subscribe to supabase.auth.onAuthStateChange.
 *     Only AuthContext subscribes to that event.
 *     This context restores its session via getSession() on
 *     mount, then manages state directly via login/logout.
 * ─────────────────────────────────────────────────
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase.js';

const AdminContext = createContext(null);

const ADMIN_ROLES = ['super_admin', 'support_admin'];

export function AdminProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * fetchController — reads the controllers table row for this user.
     * Returns null if not found, role doesn't match, or query times out.
     */
    const fetchController = useCallback(async (userId, timeoutMs = 5000) => {
        if (!userId) return null;
        try {
            const { data, error } = await Promise.race([
                supabase
                    .from('controllers')
                    .select('*')
                    .eq('id', userId)
                    .in('role', ADMIN_ROLES)
                    .maybeSingle(),
                new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), timeoutMs)),
            ]);
            if (error) { console.warn('[Admin] fetchController error:', error.message); return null; }
            return data ?? null;
        } catch (err) {
            console.warn('[Admin] fetchController timeout/error:', err.message);
            return null;
        }
    }, []);

    // ── Restore session on mount (one-time, no listener) ─────────────────────
    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!mounted) return;
            if (session?.user) {
                // Use 3s timeout for session restore (faster than login's 5s)
                const ctrl = await fetchController(session.user.id, 3000);
                if (mounted) {
                    setAdmin(ctrl ? { ...ctrl, email: session.user.email } : null);
                    setLoading(false);
                }
            } else {
                if (mounted) setLoading(false);
            }
        }).catch(() => { if (mounted) setLoading(false); });

        return () => { mounted = false; };
    }, [fetchController]);

    // ── Login ─────────────────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        setLoading(true);
        try {
            // Step 1: Supabase auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(), password,
            });
            if (error) {
                throw new Error(
                    error.message.toLowerCase().includes('invalid login credentials')
                        ? 'Invalid email or password.'
                        : error.message
                );
            }

            // Step 2: Verify admin role in controllers table
            const ctrl = await fetchController(data.user.id);
            if (!ctrl) {
                await supabase.auth.signOut();
                throw new Error(
                    'No admin record found for this account. ' +
                    'Make sure a row exists in the controllers table with role = super_admin or support_admin.'
                );
            }

            if (ctrl.status === 'suspended') {
                await supabase.auth.signOut();
                throw new Error('This admin account has been suspended.');
            }

            // Step 3: Set state and return
            const adminSession = { ...ctrl, email: data.user.email };
            setAdmin(adminSession);
            setLoading(false);
            return adminSession;
        } catch (err) {
            setLoading(false);
            throw err;
        }
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
    if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>');
    return ctx;
}
