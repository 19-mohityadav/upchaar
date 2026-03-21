/**
 * DoctorContext.jsx
 * ─────────────────────────────────────────────────
 * Doctor portal authentication and session management.
 *
 * ⚠️  Does NOT subscribe to supabase.auth.onAuthStateChange.
 *     Only AuthContext subscribes to that event.
 *     Session is restored via getSession() on mount only.
 * ─────────────────────────────────────────────────
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase.js';

const DoctorContext = createContext(null);

const formatUser = (user) => {
    if (!user) return null;
    const meta = user.user_metadata || {};
    return { id: user.id, email: user.email, phone: user.phone || meta.phone, ...meta };
};

export function DoctorProvider({ children }) {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Restore session on mount (one-time, no listener) ─────────────────────
    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            setDoctor(session?.user ? formatUser(session.user) : null);
            if (mounted) setLoading(false);
        }).catch(() => { if (mounted) setLoading(false); });

        return () => { mounted = false; };
    }, []);

    // ── Login ─────────────────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(), password,
        });
        if (error) {
            throw new Error(
                error.message.includes('Invalid login credentials')
                    ? 'Invalid credentials. Please check your email and password.'
                    : error.message
            );
        }
        if (data?.user?.user_metadata?.status === 'Suspended') {
            await supabase.auth.signOut();
            throw new Error('Your account has been suspended. Contact admin.');
        }
        const formatted = formatUser(data.user);
        setDoctor(formatted);
        return formatted;
    }, []);

    // ── Register ──────────────────────────────────────────────────────────────
    const register = useCallback(async ({ fullName, email, phone, password, specialization, city }) => {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: {
                    fullName: fullName.trim(),
                    phone: phone.trim(),
                    specialization: specialization || 'General Physician',
                    city: city || '',
                    experience: 0, fee: 500, status: 'Pending', bio: '',
                    gender: '', degree: 'MBBS', clinicName: '',
                    languages: ['English'], availableDays: [],
                    hoursFrom: '09:00', hoursTo: '17:00',
                    rating: 0, totalAppointments: 0, totalRevenue: 0,
                    avatarColor: '#0d9488', joinedAt: new Date().toISOString(),
                },
            },
        });
        if (error) {
            throw new Error(
                error.message.includes('already registered')
                    ? 'An account with this email already exists.'
                    : error.message
            );
        }
        const userId = data.user?.id;
        if (userId) {
            await supabase.from('profiles').insert({
                id: userId, email: email.trim(),
                full_name: fullName.trim(), phone: phone.trim(),
                profile_type: 'doctor', status: 'pending',
            });
            await supabase.from('doctors').insert({
                profile_id: userId, full_name: fullName.trim(),
                email: email.trim(), phone: phone.trim(),
                specialization: specialization || 'General Physician',
                city: city || '', status: 'Pending',
            });
        }
        return formatUser(data.user);
    }, []);

    // ── Logout ────────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setDoctor(null);
    }, []);

    // ── Update profile ────────────────────────────────────────────────────────
    const updateProfile = useCallback(async (updates) => {
        const { data, error } = await supabase.auth.updateUser({ data: updates });
        if (error) throw new Error(error.message);
        setDoctor(formatUser(data.user));
    }, []);

    return (
        <DoctorContext.Provider value={{ doctor, login, register, logout, updateProfile, loading }}>
            {children}
        </DoctorContext.Provider>
    );
}

export function useDoctor() {
    const ctx = useContext(DoctorContext);
    if (!ctx) throw new Error('useDoctor must be used inside <DoctorProvider>');
    return ctx;
}
