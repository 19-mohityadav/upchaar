import { Users, Phone, Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const PATIENTS = [
    { id: 'P-001', name: 'Rahul Kumar', age: 32, phone: '9876000001', lastVisit: '26 Feb 2026', visits: 5, condition: 'Hypertension', status: 'Active' },
    { id: 'P-002', name: 'Priya Singh', age: 28, phone: '9876000002', lastVisit: '24 Feb 2026', visits: 3, condition: 'Post-op recovery', status: 'Active' },
    { id: 'P-003', name: 'Mohan Das', age: 55, phone: '9876000003', lastVisit: '20 Feb 2026', visits: 8, condition: 'Diabetes Type 2', status: 'Active' },
    { id: 'P-004', name: 'Anjali Rao', age: 42, phone: '9876000004', lastVisit: '15 Feb 2026', visits: 12, condition: 'Thyroid disorder', status: 'Active' },
    { id: 'P-005', name: 'Suresh Nair', age: 67, phone: '9876000005', lastVisit: '10 Feb 2026', visits: 4, condition: 'Arthritis', status: 'Active' },
    { id: 'P-006', name: 'Divya Menon', age: 35, phone: '9876000006', lastVisit: '5 Feb 2026', visits: 2, condition: 'Migraine', status: 'Active' },
];

export default function DoctorPatients() {
    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold text-slate-800">My Patients</h1>
                <p className="text-sm text-slate-500 mt-0.5">{PATIENTS.length} patients under your care</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PATIENTS.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm flex-shrink-0">
                                {p.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-800">{p.name}</h3>
                                    <span className="text-xs text-slate-400">{p.id}</span>
                                </div>
                                <p className="text-xs text-primary font-medium mt-0.5">{p.condition}</p>
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500"><Users size={11} /> Age {p.age}</div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500"><Phone size={11} /> {p.phone}</div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500"><Calendar size={11} /> {p.lastVisit}</div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500"><FileText size={11} /> {p.visits} visits</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
