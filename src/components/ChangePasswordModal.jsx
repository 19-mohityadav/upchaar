/**
 * ChangePasswordModal.jsx
 * ─────────────────────────────────────────────────
 * Reusable modal for changing the currently logged-in
 * user's password via Supabase Auth.
 *
 * Props:
 *   isOpen   – boolean, controls visibility
 *   onClose  – () => void, called on close / success
 * ─────────────────────────────────────────────────
 */

import { useState } from 'react';
import { supabase } from '@/lib/supabase.js';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChangePasswordModal({ isOpen, onClose }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const reset = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
        setError('');
        setSuccess(false);
        setLoading(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    // Password strength checks
    const checks = [
        { label: 'At least 8 characters', pass: newPassword.length >= 8 },
        { label: 'Contains a number', pass: /\d/.test(newPassword) },
        { label: 'Contains uppercase & lowercase', pass: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) },
    ];
    const strength = checks.filter(c => c.pass).length;
    const strengthColor = strength === 0 ? 'bg-slate-200' : strength === 1 ? 'bg-red-400' : strength === 2 ? 'bg-amber-400' : 'bg-emerald-500';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!currentPassword) { setError('Please enter your current password.'); return; }
        if (newPassword.length < 8) { setError('New password must be at least 8 characters.'); return; }
        if (newPassword !== confirmPassword) { setError('New passwords do not match.'); return; }
        if (newPassword === currentPassword) { setError('New password must be different from current password.'); return; }

        setLoading(true);

        try {
            // Step 1: Re-authenticate using currentPassword
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) throw new Error('Could not retrieve your account. Please re-login.');

            const { error: signInErr } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });
            if (signInErr) throw new Error('Current password is incorrect.');

            // Step 2: Update the password
            const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
            if (updateErr) throw updateErr;

            setSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 2000);
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
                                        <Lock size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-800 text-base">Change Password</h2>
                                        <p className="text-xs text-slate-500">Update your account password</p>
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
                                        <p className="font-bold text-slate-800 text-lg">Password Updated!</p>
                                        <p className="text-sm text-slate-500 text-center">
                                            Your password has been changed successfully.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Current Password */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrent ? 'text' : 'password'}
                                                    value={currentPassword}
                                                    onChange={e => setCurrentPassword(e.target.value)}
                                                    placeholder="Enter current password"
                                                    className="w-full px-4 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-slate-50 focus:bg-white"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrent(v => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                                >
                                                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNew ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                    className="w-full px-4 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-slate-50 focus:bg-white"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNew(v => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                                >
                                                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>

                                            {/* Strength bar */}
                                            {newPassword && (
                                                <div className="mt-2 space-y-1.5">
                                                    <div className="flex gap-1">
                                                        {[0, 1, 2].map(i => (
                                                            <div
                                                                key={i}
                                                                className={cn(
                                                                    'h-1 flex-1 rounded-full transition-all duration-300',
                                                                    i < strength ? strengthColor : 'bg-slate-200'
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                    <ul className="space-y-1">
                                                        {checks.map(({ label, pass }) => (
                                                            <li key={label} className={cn('flex items-center gap-1.5 text-[11px]', pass ? 'text-emerald-600' : 'text-slate-400')}>
                                                                <span>{pass ? '✓' : '○'}</span> {label}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirm ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={e => setConfirmPassword(e.target.value)}
                                                    placeholder="Repeat new password"
                                                    className={cn(
                                                        'w-full px-4 py-2.5 pr-10 text-sm border rounded-xl focus:outline-none focus:ring-2 transition bg-slate-50 focus:bg-white',
                                                        confirmPassword && confirmPassword !== newPassword
                                                            ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                                                            : 'border-slate-200 focus:ring-primary/30 focus:border-primary'
                                                    )}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirm(v => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                                >
                                                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>
                                            {confirmPassword && confirmPassword !== newPassword && (
                                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                            )}
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
                                                disabled={loading}
                                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-teal-500 hover:opacity-90 transition shadow-sm shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2"
                                            >
                                                {loading
                                                    ? <><Loader2 size={14} className="animate-spin" /> Updating…</>
                                                    : 'Update Password'
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
