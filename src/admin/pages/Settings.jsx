import { useState } from 'react';
import { DEFAULT_SETTINGS } from '@/lib/constants.js';
import { Plus, Trash2, Save, CheckCircle, Image, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Settings() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [newSpec, setNewSpec] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const update = (key, val) => setSettings(s => ({ ...s, [key]: val }));

    const addSpec = () => {
        if (!newSpec.trim()) return;
        update('specializations', [...settings.specializations, newSpec.trim()]);
        setNewSpec('');
    };

    const removeSpec = (idx) => update('specializations', settings.specializations.filter((_, i) => i !== idx));

    const toggleBanner = (id) => update('banners', settings.banners.map(b => b.id === id ? { ...b, active: !b.active } : b));
    const removeBanner = (id) => update('banners', settings.banners.filter(b => b.id !== id));

    const addBanner = () => {
        update('banners', [...settings.banners, { id: Date.now(), title: 'New Banner', active: false, url: '' }]);
    };

    const save = () => showToast('Settings saved successfully!');

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-xl font-bold text-slate-800">Platform Settings</h1>
                <p className="text-sm text-slate-500 mt-0.5">Configure platform-wide settings</p>
            </div>

            {/* Platform Config */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <h2 className="font-semibold text-slate-800 text-base mb-3">Platform Configuration</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { label: 'Commission Percentage (%)', key: 'commissionPercent', type: 'number', min: 0, max: 50 },
                        { label: 'Default Currency', key: 'currency', type: 'text' },
                        { label: 'Platform Booking Fee (₹)', key: 'bookingFee', type: 'number', min: 0 },
                        { label: 'Minimum Notice Hours', key: 'minNoticeHours', type: 'number', min: 0 },
                        { label: 'Free Cancellation Window (hrs)', key: 'cancellationWindow', type: 'number', min: 0 },
                    ].map(({ label, key, type, min, max }) => (
                        <div key={key}>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{label}</label>
                            <input type={type} value={settings[key]} min={min} max={max}
                                onChange={e => update(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Specializations */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-800 text-base mb-4">Manage Specializations</h2>
                <div className="flex gap-2 mb-4">
                    <input type="text" placeholder="Add new specialization…" value={newSpec}
                        onChange={e => setNewSpec(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addSpec()}
                        className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                    <button onClick={addSpec} className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition flex items-center gap-1.5">
                        <Plus size={14} /> Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
                    {settings.specializations.map((spec, i) => (
                        <div key={i} className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-700 hover:border-red-200 hover:bg-red-50 transition-colors">
                            <span>{spec}</span>
                            <button onClick={() => removeSpec(i)} className="h-4 w-4 rounded-full flex items-center justify-center text-slate-300 group-hover:text-red-400 transition-colors">
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Banners */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-slate-800 text-base">Platform Banners</h2>
                    <button onClick={addBanner} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                        <Plus size={13} /> Add Banner
                    </button>
                </div>
                <div className="space-y-3">
                    {settings.banners.map(banner => (
                        <div key={banner.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <Image size={16} className="text-slate-400" />
                            </div>
                            <input type="text" value={banner.title}
                                onChange={e => update('banners', settings.banners.map(b => b.id === banner.id ? { ...b, title: e.target.value } : b))}
                                className="flex-1 h-9 px-2 rounded-lg border border-transparent hover:border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm bg-transparent focus:bg-white transition" />
                            <label className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-all',
                                banner.active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-primary/30')}>
                                <input type="checkbox" className="hidden" checked={banner.active} onChange={() => toggleBanner(banner.id)} />
                                {banner.active ? 'Active' : 'Inactive'}
                            </label>
                            <button onClick={() => removeBanner(banner.id)} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Save */}
            <button onClick={save}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 shadow-md shadow-primary/25 transition-all">
                <Save size={15} /> Save Settings
            </button>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg bg-emerald-500 text-white text-sm font-medium flex items-center gap-2">
                        <CheckCircle size={15} /> {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
