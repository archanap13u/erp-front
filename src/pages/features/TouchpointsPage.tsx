import React, { useEffect, useState } from 'react';
import { MessageSquare, Calendar, Phone, Mail, ArrowRight } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function TouchpointsPage() {
    const [interactions, setInteractions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Mapping 'Touchpoints' to 'Communication' or 'Note'
                const orgId = localStorage.getItem('organization_id');
                const res = await fetch(`/api/resource/communication?organizationId=${orgId || ''}`);
                const json = await res.json();
                setInteractions((json.data || []).slice(0, 10));
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
                title="Touchpoints & Interactions"
                newHref="/communication/new"
                newLabel="Log Interaction"
                summaryItems={[
                    { label: 'Recent Interactions', value: loading ? '...' : interactions.length || 0, color: 'text-purple-500', doctype: 'communication' },
                    { label: 'Scheduled', value: '0', color: 'text-blue-500', doctype: 'communication' },
                ]}
                masterCards={[
                    { label: 'All Logs', icon: MessageSquare, count: interactions.length || 0, href: '/communication' },
                    { label: 'Calendar', icon: Calendar, count: 'View', href: '/calendar' },
                ]}
                shortcuts={[
                    { label: 'Log Call', href: '/communication/new?type=Phone' },
                    { label: 'Log Email', href: '/communication/new?type=Email' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <MessageSquare size={18} className="text-purple-600" />
                            Recent Activity
                        </h3>
                        <Link to="/communication" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {interactions.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No interactions logged.</div>
                        ) : (
                            interactions.map((msg, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-full mt-1">
                                        {msg.communication_type === 'Phone' ? <Phone size={14} /> : <Mail size={14} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[13px] font-bold text-[#1d2129]">{msg.subject || 'No Subject'}</p>
                                            <span className="text-[10px] text-gray-500">{msg.communication_date || 'Date N/A'}</span>
                                        </div>
                                        <p className="text-[12px] text-gray-600 mt-1 line-clamp-2">{msg.content || '...'}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Quick Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/communication/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Log Interaction
                        </Link>
                    </div>
                </div>
                <MessageSquare className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
