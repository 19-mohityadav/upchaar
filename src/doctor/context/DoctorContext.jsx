import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase.js';

const DoctorContext = createContext(null);

export function DoctorProvider({ children }) {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    const formatUser = (user) => {
        if (!user) return null;
        const meta = user.user_metadata || {};
        return {
            id: user.id,
            email: user.email,
            phone: user.phone || meta.phone,
            ...meta
        };
    };

    useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            setDoctor(session?.user ? formatUser(session.user) : null);
            if (mounted) setLoading(false);
        }).catch(() => {
            if (mounted) setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return;
            if (event === 'SIGNED_OUT') { setDoctor(null); setLoading(false); return; }
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                setDoctor(session?.user ? formatUser(session.user) : null);
                if (mounted) setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const login = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
        });

        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                throw new Error('Invalid credentials. Please check your email and password.');
            }
            throw new Error(error.message);
        }

        if (data?.user?.user_metadata?.status === 'Suspended') {
            await supabase.auth.signOut();
            throw new Error('Your account has been suspended. Contact admin.');
        }

        return formatUser(data.user);
    }, []);

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
                    experience: 0,
                    fee: 500,
                    status: 'Pending',
                    bio: '',
                    gender: '',
                    degree: 'MBBS',
                    clinicName: '',
                    languages: ['English'],
                    availableDays: [],
                    hoursFrom: '09:00',
                    hoursTo: '17:00',
                    rating: 0,
                    totalAppointments: 0,
                    totalRevenue: 0,
                    avatarColor: '#0d9488',
                    joinedAt: new Date().toISOString(),
                }
            }
        });

        if (error) {
            if (error.message.includes('already registered')) {
                throw new Error('An account with this email already exists.');
            }
            throw new Error(error.message);
        }

        const userId = data.user?.id;
        if (userId) {
            // Step 2: Insert into public.profiles
            await supabase.from('profiles').insert({
                id: userId,
                email: email.trim(),
                full_name: fullName.trim(),
                phone: phone.trim(),
                profile_type: 'doctor',
                status: 'pending'
            });

            // Step 3: Insert into public.doctors
            await supabase.from('doctors').insert({
                profile_id: userId,
                full_name: fullName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                specialization: specialization || 'General Physician',
                city: city || '',
                status: 'Pending'
            });
        }

        return formatUser(data.user);
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    const updateProfile = useCallback(async (updates) => {
        const { data, error } = await supabase.auth.updateUser({
            data: updates
        });

        if (error) throw new Error(error.message);
        setDoctor(formatUser(data.user));
    }, []);

    return (
        <DoctorContext.Provider value={{ doctor, login, register, logout, updateProfile, loading }}>
            {!loading ? children : (
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
            )}
        </DoctorContext.Provider>
    );
}

export function useDoctor() {
    const ctx = useContext(DoctorContext);
    if (!ctx) throw new Error('useDoctor must be used inside DoctorProvider');
    return ctx;
}
