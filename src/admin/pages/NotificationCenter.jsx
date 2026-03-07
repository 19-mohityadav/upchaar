import { useState } from 'react';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase.js';
import { Send, Megaphone, Mail, Users, Stethoscope, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationCenter() {
    const [tab, setTab] = useState('broadcast');
    const [notifications, setNotifications] = useState([]);
    const [broadcast, setBroadcast] = useState({ audience: 'All Doctors', subject: '', body: '' });
    const [individual, setIndividual] = useState({ search: '', selected: null, subject: '', body: '' });
    const [doctorSearch, setDoctorSearch] = useState('');
    const [toast, setToast] = useState(null);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [docsRes, patsRes] = await Promise.all([
                supabase.from('doctors').select('id, full_name, email, specialization, status'),
                supabase.from('profiles').select('id, full_name, email')
            ]);

            const docs = docsRes.data ? docsRes.data.map(d => ({ ...d, type: 'Doctor' })) : [];
            const pats = patsRes.data ? patsRes.data.map(p => ({ ...p, type: 'Patient' })) : [];

            setUsers([...docs, ...pats]);

            // For now, keep notifications local or fetch from activity_logs if you want them persistent
            setNotifications([]);
        } catch (err) {
            console.error('Failed to load users for notifications', err);
        }
    };

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const searchResults = users.filter(u =>
        (u.full_name || '').toLowerCase().includes(doctorSearch.toLowerCase())
        || (u.email || '').toLowerCase().includes(doctorSearch.toLowerCase())
    ).slice(0, 6);

    const sendBroadcast = () => {
        if (!broadcast.subject.trim() || !broadcast.body.trim()) return;
        const newNotif = {
            id: Date.now(), type: 'broadcast', audience: broadcast.audience,
            subject: broadcast.subject, sentAt: new Date().toISOString(), sentBy: 'Admin',
        };
        setNotifications(prev => [newNotif, ...prev]);
        setBroadcast({ audience: 'All Doctors', subject: '', body: '' });
        showToast('Broadcast sent successfully!');
    };

    const sendIndividual = () => {
        if (!individual.selected || !individual.subject.trim() || !individual.body.trim()) return;
        const newNotif = {
            id: Date.now(), type: 'individual',
            audience: individual.selected.full_name,
            subject: individual.subject, sentAt: new Date().toISOString(), sentBy: 'Admin',
        };
        setNotifications(prev => [newNotif, ...prev]);
        setIndividual({ search: '', selected: null, subject: '', body: '' });
        setDoctorSearch('');
        showToast('Email sent successfully!');
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold text-slate-800">Notification Center</h1>
                <p className="text-sm text-slate-500 mt-0.5">Send broadcasts and individual notifications</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Compose */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-100">
                        {[
                            { key: 'broadcast', label: 'Broadcast', icon: Megaphone },
                            { key: 'individual', label: 'Individual Email', icon: Mail },
                        ].map(({ key, label, icon: Icon }) => (
                            <button key={key} onClick={() => setTab(key)}
                                className={cn('flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition border-b-2',
                                    tab === key ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700')}>
                                <Icon size={15} /> {label}
                            </button>
                        ))}
                    </div>

                    <div className="p-5 space-y-4">
                        {tab === 'broadcast' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Audience</label>
                                    <select value={broadcast.audience} onChange={e => setBroadcast(b => ({ ...b, audience: e.target.value }))}
                                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
                                        <option>All Doctors</option>
                                        <option>All Patients</option>
                                        <option>All Users (Doctors + Patients)</option>
                                        <option>Pending Doctors Only</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Subject</label>
                                    <input type="text" placeholder="Email subject line…" value={broadcast.subject}
                                        onChange={e => setBroadcast(b => ({ ...b, subject: e.target.value }))}
                                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Message</label>
                                    <textarea rows={5} placeholder="Compose your message…" value={broadcast.body}
                                        onChange={e => setBroadcast(b => ({ ...b, body: e.target.value }))}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                                </div>
                                <button onClick={sendBroadcast} disabled={!broadcast.subject.trim() || !broadcast.body.trim()}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition">
                                    <Send size={14} /> Send Broadcast
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="relative">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Recipient</label>
                                    {individual.selected ? (
                                        <div className="flex items-center gap-2 p-2.5 rounded-xl border border-primary/30 bg-primary/5">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                                                {(individual.selected.full_name || '?')[0]}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-800">{individual.selected.full_name}</p>
                                                <p className="text-xs text-slate-500">{individual.selected.email}</p>
                                            </div>
                                            <button onClick={() => { setIndividual(i => ({ ...i, selected: null })); setDoctorSearch(''); }}
                                                className="text-slate-400 hover:text-slate-600">×</button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input placeholder="Search doctor or patient…" value={doctorSearch}
                                                onChange={e => setDoctorSearch(e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                                            {doctorSearch && searchResults.length > 0 && (
                                                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                                                    {searchResults.map(u => (
                                                        <button key={u.id} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition text-left"
                                                            onClick={() => { setIndividual(i => ({ ...i, selected: u })); setDoctorSearch(''); }}>
                                                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs flex-shrink-0">
                                                                {(u.full_name || '?')[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-slate-800">{u.full_name}</p>
                                                                <p className="text-xs text-slate-400">{u.email} · {u.specialization || 'Patient'}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Subject</label>
                                    <input type="text" placeholder="Email subject…" value={individual.subject}
                                        onChange={e => setIndividual(i => ({ ...i, subject: e.target.value }))}
                                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Message</label>
                                    <textarea rows={5} placeholder="Compose email body…" value={individual.body}
                                        onChange={e => setIndividual(i => ({ ...i, body: e.target.value }))}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                                </div>
                                <button onClick={sendIndividual} disabled={!individual.selected || !individual.subject.trim() || !individual.body.trim()}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition">
                                    <Send size={14} /> Send Email
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* History */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-800">Sent Notifications</h2>
                        <span className="text-xs text-slate-500">{notifications.length} total</span>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto">
                        {notifications.map(n => (
                            <div key={n.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                                        n.type === 'broadcast' ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-500')}>
                                        {n.type === 'broadcast' ? <Megaphone size={14} /> : <Mail size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{n.subject}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={cn('flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                                n.type === 'broadcast' ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-500')}>
                                                {n.type === 'broadcast' ? <Users size={8} /> : <Mail size={8} />}
                                                {n.audience}
                                            </span>
                                            <span className="text-[10px] text-slate-400">{format(new Date(n.sentAt), 'dd MMM · HH:mm')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
