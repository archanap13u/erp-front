import React, { useEffect, useState } from 'react';
import {
    UserCheck,
    Briefcase,
    Users,
    ArrowRight,
    Search,
    Clock,
    CheckCircle
} from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function RecruitmentPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [jobOpenings, setJobOpenings] = useState<any[]>([]);
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

                const res = await fetch(`/api/resource/jobopening${queryParams}`);
                const json = await res.json();

                const jobs = json.data || [];
                setCounts({
                    total: jobs.length,
                    open: jobs.filter((j: any) => j.status === 'Open').length,
                    closed: jobs.filter((j: any) => j.status === 'Closed').length,
                });

                setJobOpenings(jobs.slice(0, 10));

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
                title="Recruitment Management"
                newHref="/job-opening/new"
                newLabel="Post New Job"
                summaryItems={[
                    { label: 'Open Positions', value: loading ? '...' : counts.open || 0, color: 'text-blue-500', doctype: 'jobopening' },
                    { label: 'Total Jobs', value: loading ? '...' : counts.total || 0, color: 'text-purple-500', doctype: 'jobopening' },
                    { label: 'Closed Positions', value: loading ? '...' : counts.closed || 0, color: 'text-gray-500', doctype: 'jobopening' },
                ]}
                masterCards={[
                    { label: 'Job Openings', icon: Briefcase, count: '', href: '/job-opening' },
                    { label: 'Applications', icon: Users, count: '', href: '/job-application' },
                    { label: 'Candidates', icon: UserCheck, count: '', href: '/job-applicant' },
                ]}
                shortcuts={[
                    { label: 'Post Job Opening', href: '/job-opening/new' },
                    { label: 'Review Applications', href: '/job-application' },
                    { label: 'Interview Schedule', href: '/interview' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Active Job Openings */}
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Briefcase size={18} className="text-purple-600" />
                            Active Job Openings
                        </h3>
                        <Link to="/job-opening" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                        {jobOpenings.length === 0 ? (
                            <div className="col-span-2 p-8 text-center text-gray-400 italic text-[13px]">No active job openings.</div>
                        ) : (
                            jobOpenings.filter(job => job.status === 'Open').map((job, idx) => (
                                <div key={idx} className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="text-[14px] font-bold text-[#1d2129]">{job.job_title || 'Untitled Position'}</h4>
                                            <p className="text-[11px] text-gray-600 font-medium">{job.department || 'General'}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-full">
                                            {job.status || 'Open'}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[11px] text-gray-600">
                                            <Users size={12} />
                                            <span>{job.no_of_positions || 1} position(s)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-gray-600">
                                            <Clock size={12} />
                                            <span>Posted {job.posting_date ? new Date(job.posting_date).toLocaleDateString() : 'Recently'}</span>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/job-opening/${job._id || job.name}`}
                                        className="mt-3 inline-flex items-center gap-1 text-purple-600 text-[12px] font-bold hover:underline"
                                    >
                                        View Details <ArrowRight size={12} />
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h4 className="text-[16px] font-bold mb-4">Recruitment Quick Actions</h4>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/job-opening/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline flex items-center gap-2">
                                <Briefcase size={14} />
                                Post New Job
                            </Link>
                            <Link to="/job-application" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline flex items-center gap-2">
                                <Users size={14} />
                                Review Applications
                            </Link>
                            <Link to="/interview" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline flex items-center gap-2">
                                <CheckCircle size={14} />
                                Schedule Interview
                            </Link>
                        </div>
                    </div>
                    <UserCheck className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
                </div>
            </div>
        </div>
    );
}
