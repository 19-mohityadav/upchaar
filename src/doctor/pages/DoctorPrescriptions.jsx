import { motion } from 'framer-motion';
import { ClipboardList, Plus, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESCRIPTIONS = [
    { id: 'RX-001', patient: 'Rahul Kumar', date: '26 Feb 2026', diagnosis: 'Hypertension', medicines: ['Amlodipine 5mg', 'Telmisartan 40mg'], followUp: '10 Mar 2026' },
    { id: 'RX-002', patient: 'Priya Singh', date: '24 Feb 2026', diagnosis: 'Post-operative care', medicines: ['Amoxicillin 500mg', 'Paracetamol 650mg', 'Pantoprazole 40mg'], followUp: '5 Mar 2026' },
    { id: 'RX-003', patient: 'Mohan Das', date: '20 Feb 2026', diagnosis: 'Type 2 Diabetes', medicines: ['Metformin 500mg', 'Glimepiride 2mg'], followUp: '20 Mar 2026' },
    { id: 'RX-004', patient: 'Anjali Rao', date: '15 Feb 2026', diagnosis: 'Hypothyroidism', medicines: ['Thyroxine 50mcg'], followUp: '15 Apr 2026' },
];

export default function DoctorPrescriptions() {
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Prescriptions</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{PRESCRIPTIONS.length} prescriptions issued</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-teal-500 text-white text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg transition-all">
                    <Plus size={16} /> New Prescription
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESCRIPTIONS.map((rx, i) => (
                    <motion.div key={rx.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="font-semibold text-slate-800">{rx.patient}</p>
                                <p className="text-xs text-slate-400">{rx.id} · {rx.date}</p>
                            </div>
                            <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-primary hover:text-white transition-all">
                                <Eye size={14} />
                            </button>
                        </div>
                        <div className="mb-3 p-3 rounded-xl bg-teal-50">
                            <p className="text-xs font-semibold text-teal-700 mb-1">Diagnosis</p>
                            <p className="text-xs text-teal-600">{rx.diagnosis}</p>
                        </div>
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-slate-500 mb-1.5">Medicines</p>
                            <div className="flex flex-wrap gap-1.5">
                                {rx.medicines.map(m => (
                                    <span key={m} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-medium">{m}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <ClipboardList size={11} />
                            <span>Follow-up: <span className="font-semibold text-slate-700">{rx.followUp}</span></span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
