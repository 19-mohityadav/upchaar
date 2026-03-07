/**
 * BloggerProfile.jsx
 * ─────────────────────────────────────────────────
 * Blogger profile page – edit display name, specialty, bio,
 * avatar color, and upload a profile photo.
 * ─────────────────────────────────────────────────
 */

import { useRef, useState } from 'react';
import { useBlog } from '../context/BlogContext.jsx';
import { Save, CheckCircle, Camera, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadAvatar } from '@/lib/uploadImage.js';
import { supabase } from '@/lib/supabase.js';

const COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899'];
const SPECIALTIES = ['General Medicine', 'Cardiologist', 'Dermatologist', 'Nutritionist', 'Psychiatrist', 'Neurologist', 'Paediatrician', 'Gynaecologist', 'Other'];

export default function BloggerProfile() {
    const { blogger, updateBlogger } = useBlog();
    const fileInputRef = useRef(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState('');

    const [form, setForm] = useState({
        name: blogger?.name || '',
        bio: blogger?.bio || '',
        specialty: blogger?.specialty || SPECIALTIES[0],
        avatarColor: blogger?.avatarColor || COLORS[0],
    });
    const [toast, setToast] = useState(false);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
    const initials = form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'B';

    // The current avatar photo URL (from Supabase Storage, if uploaded)
    const avatarPhotoUrl = blogger?.avatarUrl || null;

    /**
     * handleAvatarUpload
     * Uploads the selected photo to Supabase Storage under the blogger's
     * auth user ID folder. Saves the returned public URL via updateBlogger().
     */
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarError('');
        setUploadingAvatar(true);
        try {
            // Get the current Supabase auth user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.id) throw new Error('Not signed in. Please log in again.');

            const url = await uploadAvatar(file, user.id);
            updateBlogger({ avatarUrl: url });
        } catch (err) {
            setAvatarError(err.message || 'Upload failed. Please try again.');
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = () => {
        updateBlogger(form);
        setToast(true);
        setTimeout(() => setToast(false), 3000);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
                <p className="text-sm text-slate-500 mt-0.5">Your public bio shown on all blog articles</p>
            </div>

            {/* ── Avatar preview card ─────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-6">

                {/* Avatar circle + camera button */}
                <div className="relative flex-shrink-0">
                    <div
                        className="h-20 w-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md overflow-hidden"
                        style={{ background: avatarPhotoUrl ? '#e2e8f0' : form.avatarColor }}
                    >
                        {avatarPhotoUrl
                            ? <img src={avatarPhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                            : initials
                        }
                    </div>

                    {/* Camera overlay button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        title="Upload profile photo"
                        className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white border-2 border-slate-100 text-primary flex items-center justify-center shadow-md hover:bg-primary/5 transition disabled:opacity-60"
                    >
                        {uploadingAvatar
                            ? <Loader2 size={13} className="animate-spin text-primary" />
                            : <Camera size={13} />
                        }
                    </button>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-lg">{form.name || 'Your Name'}</p>
                    <p className="text-sm text-primary">{form.specialty}</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm line-clamp-2">{form.bio || 'Your bio will appear here…'}</p>
                    {avatarError && (
                        <p className="text-xs text-red-500 mt-1.5">⚠ {avatarError}</p>
                    )}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="mt-2 text-xs text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                        <Camera size={11} />
                        {uploadingAvatar ? 'Uploading photo…' : avatarPhotoUrl ? 'Change photo' : 'Upload photo'}
                    </button>
                </div>
            </div>

            {/* ── Edit form ───────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Display Name</label>
                    <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                        placeholder="Dr. Firstname Lastname"
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Specialty</label>
                    <select value={form.specialty} onChange={e => set('specialty', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
                        {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio <span className="text-slate-400 text-xs">(max 200 chars)</span></label>
                    <textarea value={form.bio} onChange={e => set('bio', e.target.value.slice(0, 200))} rows={3}
                        placeholder="A brief description about yourself and your area of expertise…"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                    <p className="text-[11px] text-slate-400 text-right mt-1">{form.bio.length}/200</p>
                </div>

                {/* Avatar color (used when no photo uploaded) */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Avatar Color <span className="text-slate-400 text-xs">(used when no photo is set)</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {COLORS.map(c => (
                            <button key={c} type="button" onClick={() => set('avatarColor', c)}
                                className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${form.avatarColor === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`}
                                style={{ background: c }}>
                                {form.avatarColor === c && <CheckCircle size={14} className="text-white" />}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 shadow-md shadow-primary/20 transition">
                    <Save size={15} /> Save Profile
                </button>
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg bg-emerald-500 text-white text-sm font-medium">
                        <CheckCircle size={15} /> Profile saved successfully!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
