import { useAdmin } from '../context/AdminContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { fetchDoctors } from '@/lib/adminApi.js';

export default function AdminTopbar() {
    const { admin, logout, isSuperAdmin } = useAdmin();
    const navigate = useNavigate();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchVal, setSearchVal] = useState('');
    const [pendingCount, setPendingCount] = useState(0);

    // Initial load
    useEffect(() => {
        const getPending = async () => {
            try {
                const docs = await fetchDoctors();
                setPendingCount(docs.filter(d => d.status === 'Pending').length);
            } catch (err) { }
        };
        getPending();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const initials = admin?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD';

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-6 flex-shrink-0 z-10">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search doctors, patients…"
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
            </div>

            <div className="flex-1" />

            {/* Notification bell */}
            <button className="relative h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                <Bell size={18} />
                {pendingCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                )}
            </button>

            {/* Admin avatar dropdown */}
            <div className="relative">
                <button
                    onClick={() => setDropdownOpen(o => !o)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-primary/40 hover:bg-slate-50 transition-all"
                >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white text-xs font-bold">
                        {initials}
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-semibold text-slate-800 leading-none">{admin?.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{isSuperAdmin ? 'Super Admin' : 'Support Admin'}</p>
                    </div>
                    <ChevronDown size={14} className={cn('text-slate-400 transition-transform', dropdownOpen && 'rotate-180')} />
                </button>

                {dropdownOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl z-20 overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100">
                                <p className="text-sm font-semibold text-slate-800">{admin?.name}</p>
                                <p className="text-xs text-slate-500">{admin?.email}</p>
                                <span className={cn(
                                    'inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                                    isSuperAdmin ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-600'
                                )}>
                                    <Shield size={9} /> {isSuperAdmin ? 'Super Admin' : 'Support Admin'}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={15} /> Sign Out
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
