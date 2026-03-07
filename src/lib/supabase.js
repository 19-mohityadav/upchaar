import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing. Check your .env file.');
}

/**
 * Cookie-based session storage adapter.
 * Sessions expire after 1 hour (maxAge = 3600 seconds).
 */
const SESSION_MAX_AGE = 3600; // 1 hour in seconds
const COOKIE_NAME = 'sb_auth_session';

const cookieStorage = {
    getItem(key) {
        if (typeof document === 'undefined') return null;
        const match = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${key}=`));
        if (!match) return null;
        try {
            return decodeURIComponent(match.split('=').slice(1).join('='));
        } catch {
            return null;
        }
    },
    setItem(key, value) {
        if (typeof document === 'undefined') return;
        const encoded = encodeURIComponent(value);
        document.cookie = [
            `${key}=${encoded}`,
            `max-age=${SESSION_MAX_AGE}`,
            'path=/',
            'SameSite=Lax',
            // Add Secure flag in production
            ...(location.protocol === 'https:' ? ['Secure'] : []),
        ].join('; ');
    },
    removeItem(key) {
        if (typeof document === 'undefined') return;
        // Expire immediately
        document.cookie = `${key}=; max-age=0; path=/; SameSite=Lax`;
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        storage: cookieStorage,
        storageKey: COOKIE_NAME,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});
