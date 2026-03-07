/**
 * PatientDashboard.jsx
 * ─────────────────────────────────────────────────
 * Main dashboard for authenticated patients.
 * Features: profile photo upload, quick actions, profile info card.
 * ─────────────────────────────────────────────────
 */

import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePatient } from '../context/PatientContext.jsx';
import { motion } from 'framer-motion';
import {
    Heart, User, Calendar, FileText, Pill,
    MapPin, LogOut, ChevronRight, Activity, Shield, Camera, Loader2
} from 'lucide-react';
import { uploadAvatar } from '@/lib/uploadImage.js';

// ── Quick action cards shown on the dashboard ─────
const QUICK_ACTIONS = [
    { icon: Calendar, label: 'Book Appointment', desc: 'Schedule with a doctor', color: 'from-blue-500 to-indigo-500', href: '/doctors' },
    { icon: FileText, label: 'Medical Records', desc: 'View your health history', color: 'from-violet-500 to-purple-500', href: '/records' },
    { icon: Pill, label: 'Prescriptions', desc: 'Your current medications', color: 'from-orange-500 to-amber-500', href: '/records' },
    { icon: MapPin, label: 'Find Nearby', desc: 'Hospitals & clinics', color: 'from-emerald-500 to-teal-500', href: '/hospitals' },
];

export default function PatientDashboard() {
    const { patient, loading, signOut, updateProfile } = usePatient();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState('');

    const handleSignOut = async () => {
        await signOut();
        navigate('/', { replace: true });
    };

    /**
     * handleAvatarChange
     * Uploads the selected image to Supabase Storage and saves
     * the public URL to public.profiles.avatar_url.
     */
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarError('');
        setUploadingAvatar(true);
        try {
            const url = await uploadAvatar(file, patient.id);
            await updateProfile({ avatar_url: url });
        } catch (err) {
            setAvatarError(err.message || 'Upload failed. Try again.');
        } finally {
            setUploadingAvatar(false);
            // Reset input so the same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Show spinner while session is being restored from Supabase
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
            </div>
        );
    }

    // Redirect unauthenticated users to login
    if (!patient) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Shield size={48} className="mx-auto text-slate-300 mb-4" />
                    <h2 className="text-xl font-bold text-slate-700 mb-2">Access Restricted</h2>
                    <p className="text-slate-500 mb-6">Please sign in to view your dashboard.</p>
                    <Link
                        to="/patient/login"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition"
                    >
                        Go to Patient Login
                    </Link>
                </div>
            </div>
        );
    }

    // Get initials for avatar fallback
    const initials = patient.full_name
        ? patient.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'P';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30">

            {/* ── Top navigation bar ───────────────── */}
            <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Brand */}
                    <div className="flex items-center gap-2">
                        <Heart size={20} className="text-emerald-500" />
                        <span className="font-bold text-slate-800 text-sm">Sanjiwani Health</span>
                    </div>

                    {/* Patient name + sign out */}
                    <div className="flex items-center gap-3">
                        {/* Nav avatar */}
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {patient.avatar_url
                                ? <img src={patient.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                : initials
                            }
                        </div>
                        <span className="text-sm font-medium text-slate-700 hidden sm:block">
                            {patient.full_name || patient.email}
                        </span>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500 text-xs font-medium transition"
                        >
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 py-8">

                {/* ── Welcome hero ──────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 rounded-3xl p-6 sm:p-8 mb-8 text-white shadow-xl shadow-emerald-500/20"
                >
                    <div className="flex items-center gap-4">
                        {/* Avatar with upload button */}
                        <div className="relative flex-shrink-0">
                            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                                {patient.avatar_url
                                    ? <img src={patient.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    : initials
                                }
                            </div>
                            {/* Camera button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                title="Change profile photo"
                                className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-md hover:bg-emerald-50 transition disabled:opacity-60"
                            >
                                {uploadingAvatar
                                    ? <Loader2 size={13} className="animate-spin" />
                                    : <Camera size={13} />
                                }
                            </button>
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>

                        <div>
                            <p className="text-white/70 text-sm">Welcome back,</p>
                            <h1 className="text-2xl font-bold">{patient.full_name || 'Patient'}</h1>
                            <p className="text-white/70 text-sm mt-0.5">{patient.email}</p>
                        </div>
                    </div>

                    {/* Upload error */}
                    {avatarError && (
                        <p className="mt-3 text-xs text-red-100 bg-white/10 rounded-lg px-3 py-2">
                            ⚠ {avatarError}
                        </p>
                    )}

                    {/* Health summary pills */}
                    <div className="flex flex-wrap gap-2 mt-5">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-medium">
                            <Activity size={12} /> Status: {patient.status ?? 'Active'}
                        </span>
                        {patient.phone && (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-medium">
                                📱 {patient.phone}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-medium">
                            <User size={12} /> Patient Account
                        </span>
                    </div>
                </motion.div>

                {/* ── Quick actions grid ────────────── */}
                <h2 className="text-base font-semibold text-slate-700 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {QUICK_ACTIONS.map(({ icon: Icon, label, desc, color, href }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i, duration: 0.35 }}
                        >
                            <Link
                                to={href}
                                className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                            >
                                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md flex-shrink-0`}>
                                    <Icon size={22} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-800 text-sm">{label}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                                </div>
                                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition" />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* ── Profile info card ─────────────── */}
                <h2 className="text-base font-semibold text-slate-700 mb-4">Your Profile</h2>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: 'Full Name', value: patient.full_name || '—' },
                            { label: 'Email', value: patient.email },
                            { label: 'Phone', value: patient.phone || '—' },
                            { label: 'Account Type', value: 'Patient' },
                            { label: 'Status', value: patient.status ?? 'Active' },
                            { label: 'Member Since', value: patient.created_at ? new Date(patient.created_at).toLocaleDateString() : '—' },
                        ].map(({ label, value }) => (
                            <div key={label} className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">{label}</p>
                                <p className="text-sm font-medium text-slate-800">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Change photo hint */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                            Click the camera icon on your avatar to change your profile photo.
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-emerald-600 hover:bg-emerald-50 transition font-medium disabled:opacity-50"
                        >
                            {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                            {uploadingAvatar ? 'Uploading…' : 'Upload Photo'}
                        </button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
