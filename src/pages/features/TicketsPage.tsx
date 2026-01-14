import React, { useEffect, useState } from 'react';
import { LifeBuoy, MessageSquare, CheckCircle, ArrowRight, Clock } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function TicketsPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const orgId = localStorage.getItem('organization_id');
                const deptId = localStorage.getItem('department_id');

                let queryParams = `?organizationId=${orgId || ''}`;
                if (deptId) {
                    queryParams += `&departmentId=${deptId}`;
                }

                // Using 'Issue' doctype for Tickets
                const res = await fetch(`/api/resource/issue${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    open: data.filter((t: any) => t.status === 'Open').length,
                    resolved: data.filter((t: any) => t.status === 'Closed' || t.status === 'Resolved').length,
                });

                setTickets(data.slice(0, 10));

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="space-y-8 pb-20 text-[#1d2129]">
            <Workspace
                title="Support Tickets"
                newHref="/issue/new"
                newLabel="New Ticket"
                summaryItems={[
                    { label: 'Total Tickets', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'issue' },
                    { label: 'Open', value: loading ? '...' : counts.open || 0, color: 'text-orange-500', doctype: 'issue' },
                    { label: 'Resolved', value: loading ? '...' : counts.resolved || 0, color: 'text-emerald-500', doctype: 'issue' },
                ]}
                masterCards={[
                    { label: 'All Tickets', icon: LifeBuoy, count: counts.total || 0, href: '/issue' },
                    { label: 'My Tickets', icon: MessageSquare, count: 'View', href: '/issue?my_tickets=true' },
                    { label: 'SLA Status', icon: Clock, count: 'Check', href: '/sla-status' },
                ]}
                shortcuts={[
                    { label: 'Raise Ticket', href: '/issue/new' },
                    { label: 'Knowledge Base', href: '/help-article' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <LifeBuoy size={18} className="text-red-600" />
                            Recent Tickets
                        </h3>
                        <Link to="/issue" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {tickets.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No tickets found.</div>
                        ) : (
                            tickets.map((ticket, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-red-50 text-red-600 rounded">
                                            <MessageSquare size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{ticket.subject || 'Ticket Subject'}</p>
                                            <p className="text-[11px] text-gray-500 font-mono">{ticket.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ticket.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {ticket.status || 'Open'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Support Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/issue/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Raise New Ticket
                        </Link>
                    </div>
                </div>
                <LifeBuoy className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
