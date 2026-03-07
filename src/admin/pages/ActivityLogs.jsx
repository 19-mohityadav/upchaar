import { useState, useMemo } from 'react';
import { fetchLogs } from '@/lib/adminApi.js';
import { useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const ACTION_STYLES = {
    'Approved Doctor': 'bg-emerald-50 text-emerald-600',
    'Rejected Doctor': 'bg-red-50 text-red-500',
    'Suspended Doctor': 'bg-orange-50 text-orange-500',
    'Blocked Patient': 'bg-red-50 text-red-500',
    'Unblocked Patient': 'bg-emerald-50 text-emerald-600',
    'Updated Settings': 'bg-blue-50 text-blue-500',
    'Sent Broadcast': 'bg-purple-50 text-purple-500',
    'Added Specialization': 'bg-teal-50 text-teal-600',
};

const ACTIONS = ['All Actions', 'Approved Doctor', 'Rejected Doctor', 'Suspended Doctor', 'Blocked Patient', 'Updated Settings', 'Sent Broadcast'];

export default function ActivityLogs() {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('All Actions');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const data = await fetchLogs();
            setLogs(data);
        } catch (err) {
            console.error('Failed to load logs', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => logs.filter(l => {
        const matchAction = actionFilter === 'All Actions' || l.action === actionFilter;
        const matchSearch = !search || (l.target || '').toLowerCase().includes(search.toLowerCase())
            || (l.admin || '').toLowerCase().includes(search.toLowerCase())
            || (l.action || '').toLowerCase().includes(search.toLowerCase());
        return matchAction && matchSearch;
    }), [search, actionFilter, logs]);

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold text-slate-800">Activity Logs</h1>
                <p className="text-sm text-slate-500 mt-0.5">Track all admin actions with timestamps</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input placeholder="Search logs…" value={search} onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition w-64" />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition appearance-none">
                        {ACTIONS.map(a => <option key={a}>{a}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            {['Timestamp', 'Admin', 'Admin ID', 'Action', 'Target', 'Details'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map((log, i) => (
                            <tr key={log.id} className={cn('hover:bg-slate-50/70 transition-colors', i % 2 === 0 ? '' : 'bg-slate-50/30')}>
                                <td className="px-4 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">
                                    {format(new Date(log.timestamp || log.created_at || new Date()), 'dd MMM yyyy')}<br />
                                    <span className="text-[10px]">{format(new Date(log.timestamp || log.created_at || new Date()), 'HH:mm:ss')}</span>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{log.admin}</td>
                                <td className="px-4 py-3 text-xs font-mono text-slate-400">{log.admin_id || log.adminId || 'System'}</td>
                                <td className="px-4 py-3">
                                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap', ACTION_STYLES[log.action] || 'bg-slate-100 text-slate-600')}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-600 text-xs">{log.target}</td>
                                <td className="px-4 py-3 text-slate-500 text-xs">{log.details}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">No logs found</td></tr>
                        )}
                    </tbody>
                </table>
                <div className="px-4 py-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">{filtered.length} log entries</span>
                </div>
            </div>
        </div>
    );
}
