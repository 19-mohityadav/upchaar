import { motion, AnimatePresence } from 'framer-motion';
import {
    X, TrendingUp, Calendar, FileText,
    Video, Phone, MessageSquare, ChevronRight, Activity
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

const VITALS_DATA = [
    { day: 'Mon', bp: 120 }, { day: 'Tue', bp: 118 },
    { day: 'Wed', bp: 122 }, { day: 'Thu', bp: 125 },
    { day: 'Fri', bp: 119 }, { day: 'Sat', bp: 121 },
    { day: 'Sun', bp: 115 }
];

const PAST_RECORDS = [
    { id: 'RX-892', type: 'Prescription', date: '12 Jan 2026', desc: 'Amoxicillin Course' },
    { id: 'LAB-41', type: 'Lab Report', date: '10 Jan 2026', desc: 'Complete Blood Count (CBC)' },
    { id: 'RX-840', type: 'Prescription', date: '05 Dec 2025', desc: 'Cough Syrup & Rest' },
];

export default function Patient360Drawer({ isOpen, onClose, appointment }) {
    if (!appointment) return null;

    const patientName = appointment.patient_name || appointment.patientName || appointment.patient || 'Patient';
    const patientAge = appointment.patient_age || appointment.age || '-';
    const issue = appointment.issue || 'General consultation';
    const consultationType = appointment.type || appointment.consultation_type || 'Online';
    const isVirtual = consultationType === 'Virtual' || consultationType === 'Online';
    const initials = patientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                    />

                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.5 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white/90 backdrop-blur-2xl shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.1)] border-l border-white/60 z-50 flex flex-col overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/50 bg-white/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-blue-500/20">
                                    {initials}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">{patientName}</h2>
                                    <p className="text-sm text-slate-500 font-medium">Age {patientAge} · ID: PAT-8821</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100/50 rounded-3xl p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                        <Activity size={12} strokeWidth={3} />
                                    </div>
                                    <h3 className="text-sm font-bold text-indigo-900 tracking-tight">AI Condition Summary</h3>
                                </div>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                        <p className="text-sm text-indigo-900/80 leading-snug">Patient presents with <span className="font-semibold">{issue}</span> lasting for 3 days.</p>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                        <p className="text-sm text-indigo-900/80 leading-snug">No known allergies. Previous history of mild hypertension.</p>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                        <p className="text-sm text-indigo-900/80 leading-snug">Recommended focus: Check BP and review current stress levels.</p>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Vitals: Blood Pressure</h3>
                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold flex items-center gap-1">
                                        <TrendingUp size={12} /> Stable
                                    </span>
                                </div>
                                <div className="h-24 w-full -ml-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={VITALS_DATA}>
                                            <defs>
                                                <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                                            <Area type="monotone" dataKey="bp" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorBp)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1 px-2">
                                    {VITALS_DATA.map(d => <span key={d.day}>{d.day}</span>)}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] p-2">
                                <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-50">
                                    <Calendar size={14} className="text-slate-400" />
                                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Past Records</h3>
                                </div>
                                <div className="p-2 space-y-1">
                                    {PAST_RECORDS.map((record, i) => (
                                        <button key={i} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-primary transition-colors shadow-sm">
                                                    <FileText size={14} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-semibold text-slate-800">{record.type}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{record.desc}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] font-semibold text-slate-400">{record.date}</span>
                                                <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white/80 border-t border-slate-200/50 backdrop-blur-xl">
                            <div className="flex gap-3 mb-3">
                                <button className="flex-1 py-3 rounded-2xl bg-teal-50 text-teal-700 text-sm font-bold flex items-center justify-center gap-2 hover:bg-teal-100 transition-colors">
                                    <MessageSquare size={16} /> Message
                                </button>
                                <button className="flex-1 py-3 rounded-2xl bg-slate-50 text-slate-700 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors border border-slate-200">
                                    <Phone size={16} /> Call
                                </button>
                            </div>
                            {isVirtual ? (
                                <button className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-400 text-white text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/40 relative overflow-hidden group">
                                    <span className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                        <Video size={18} />
                                    </motion.div>
                                    Join Teleconsultation
                                </button>
                            ) : (
                                <button className="w-full py-3.5 rounded-2xl bg-slate-800 text-white text-base font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                                    Start Consultation Room
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
