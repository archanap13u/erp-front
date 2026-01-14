import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle, Search, Filter } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function IssuesPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [issues, setIssues] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/issue${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                    critical: data.filter((i: any) => i.priority === 'Critical').length,
                    resolved: data.filter((i: any) => i.status === 'Resolved' || i.status === 'Closed').length,
                });

                setIssues(data.slice(0, 10));

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
                title="Issue Tracker"
                newHref="/issue/new"
                newLabel="Report Issue"
                summaryItems={[
                    { label: 'Total Issues', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'issue' },
                    { label: 'Critical', value: loading ? '...' : counts.critical || 0, color: 'text-red-500', doctype: 'issue' },
                    { label: 'Resolved', value: loading ? '...' : counts.resolved || 0, color: 'text-emerald-500', doctype: 'issue' },
                ]}
                masterCards={[
                    { label: 'All Issues', icon: AlertCircle, count: counts.total || 0, href: '/issue' },
                    { label: 'SLA Dashboard', icon: CheckCircle, count: 'View', href: '/sla-dashboard' },
                ]}
                shortcuts={[
                    { label: 'Report Issue', href: '/issue/new' },
                    { label: 'View Critical', href: '/issue?priority=Critical' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <AlertCircle size={18} className="text-red-600" />
                            Recent Issues
                        </h3>
                        <Link to="/issue" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {issues.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No issues reported.</div>
                        ) : (
                            issues.map((issue, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-red-50 text-red-600 rounded">
                                            <AlertCircle size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{issue.subject || 'Issue Summary'}</p>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                                <span>{issue.name}</span>
                                                {issue.priority && <span className={`px-1.5 py-0.5 rounded text-[10px] ${issue.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{issue.priority}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {issue.status || 'Open'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Issue Actions</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/issue/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Report New Issue
                        </Link>
                    </div>
                </div>
                <AlertCircle className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
