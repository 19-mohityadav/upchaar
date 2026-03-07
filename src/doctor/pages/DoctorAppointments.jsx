import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const APPOINTMENTS = [
    { id: 'APT-001', patient: 'Rahul Kumar', age: 32, phone: '9876000001', issue: 'Chest pain & breathlessness', time: '10:00 AM', date: '26 Feb 2026', status: 'Confirmed' },
    { id: 'APT-002', patient: 'Priya Singh', age: 28, phone: '9876000002', issue: 'Follow-up checkup post surgery', time: '11:30 AM', date: '26 Feb 2026', status: 'Confirmed' },
    { id: 'APT-003', patient: 'Mohan Das', age: 55, phone: '9876000003', issue: 'Hypertension management', time: '02:00 PM', date: '26 Feb 2026', status: 'Pending' },
    { id: 'APT-004', patient: 'Anjali Rao', age: 42, phone: '9876000004', issue: 'Diabetes review & diet plan', time: '04:30 PM', date: '26 Feb 2026', status: 'Confirmed' },
    { id: 'APT-005', patient: 'Suresh Nair', age: 67, phone: '9876000005', issue: 'Knee joint pain', time: '09:00 AM', date: '27 Feb 2026', status: 'Pending' },
    { id: 'APT-006', patient: 'Divya Menon', age: 35, phone: '9876000006', issue: 'Thyroid panel review', time: '10:00 AM', date: '27 Feb 2026', status: 'Confirmed' },
    { id: 'APT-007', patient: 'Arun Sharma', age: 48, phone: '9876000007', issue: 'ECG & cardio screening', time: '12:00 PM', date: '27 Feb 2026', status: 'Cancelled' },
];

const STATUS_STYLE = {
    Confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-600 border-amber-200',
    Cancelled: 'bg-red-50 text-red-500 border-red-200',
};

export default function DoctorAppointments() {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    const filtered = APPOINTMENTS.filter(a => {
        const matchFilter = filter === 'All' || a.status === filter;
        const matchSearch = !search || a.patient.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Appointments</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{APPOINTMENTS.length} total appointments</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input placeholder="Search patient…" value={search} onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/25 w-56" />
                </div>
                <div className="flex gap-2">
                    {['All', 'Confirmed', 'Pending', 'Cancelled'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={cn('px-4 py-2 rounded-xl text-sm font-medium border transition', filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 border-slate-200 hover:border-primary/30')}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            {['Patient', 'Age', 'Issue', 'Date & Time', 'Status', 'Actions'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map((apt, i) => (
                            <motion.tr key={apt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="font-medium text-slate-800">{apt.patient}</p>
                                        <p className="text-xs text-slate-400">{apt.phone}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600">{apt.age} yrs</td>
                                <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate text-xs">{apt.issue}</td>
                                <td className="px-4 py-3">
                                    <p className="text-slate-700 font-medium text-xs">{apt.date}</p>
                                    <p className="text-slate-400 text-xs flex items-center gap-1"><Clock size={10} /> {apt.time}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold border', STATUS_STYLE[apt.status])}>{apt.status}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1.5">
                                        <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle size={14} /></button>
                                        <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><XCircle size={14} /></button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
