import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase.js';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function EditProfileModal({ isOpen, onClose, profile }) {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setPhone(profile.phone || '');
        }
    }, [profile]);

    const handleClose = () => {
        setError('');
        setSuccess(false);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!profile?.id) throw new Error('No active profile found.');

            // Update Auth user_metadata
            const { error: authErr } = await supabase.auth.updateUser({
                data: { full_name: fullName, phone: phone }
            });
            if (authErr) throw authErr;

            // Update public.profiles
            const { error: dbErr } = await supabase
                .from('profiles')
                .update({ full_name: fullName, phone: phone, updated_at: new Date().toISOString() })
                .eq('id', profile.id);

            if (dbErr) throw dbErr;

            setSuccess(true);
            setTimeout(() => {
                handleClose();
                window.location.reload(); // Reload to refresh all contexts
            }, 1000);
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-sm">
                                        <User size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-800 text-base">Edit Profile</h2>
                                        <p className="text-xs text-slate-500">Update your personal details</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-5">
                                {success ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-8 gap-3"
                                    >
                                        <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                            <CheckCircle size={32} className="text-emerald-500" />
                                        </div>
                                        <p className="font-bold text-slate-800 text-lg">Profile Updated!</p>
                                        <p className="text-sm text-slate-500 text-center">
                                            Your changes have been saved successfully.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Full Name */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={e => setFullName(e.target.value)}
                                                    placeholder="Enter your full name"
                                                    className="w-full px-4 py-2.5 pl-10 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-slate-50 focus:bg-white"
                                                    required
                                                />
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={e => setPhone(e.target.value)}
                                                    placeholder="Enter your phone number"
                                                    className="w-full px-4 py-2.5 pl-10 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-slate-50 focus:bg-white"
                                                    required
                                                />
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                            </div>
                                        </div>

                                        {/* Error */}
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
                                            >
                                                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                                                {error}
                                            </motion.div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-1">
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading || (!fullName.trim() && !phone.trim())}
                                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-teal-500 hover:opacity-90 transition shadow-sm shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2"
                                            >
                                                {loading
                                                    ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                                                    : 'Save Changes'
                                                }
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
