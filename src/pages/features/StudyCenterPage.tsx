import React, { useEffect, useState } from 'react';
import { Building, MapPin, Users, ArrowRight } from 'lucide-react';
import Workspace from '../../components/Workspace';
import { Link } from 'react-router-dom';

export default function StudyCenterPage() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [centers, setCenters] = useState<any[]>([]);
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

                // Assuming 'Branch' or custom doctype 'Study Center'
                // Using 'Branch' as a fallback if specific Study Center doctype missing
                const res = await fetch(`/api/resource/branch${queryParams}`);
                const json = await res.json();
                const data = json.data || [];

                setCounts({
                    total: data.length,
                });

                setCenters(data.slice(0, 10));

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
                title="Study Centers"
                newHref="/branch/new"
                newLabel="Add Center"
                summaryItems={[
                    { label: 'Total Centers', value: loading ? '...' : counts.total || 0, color: 'text-blue-500', doctype: 'branch' },
                ]}
                masterCards={[
                    { label: 'All Centers', icon: Building, count: counts.total || 0, href: '/branch' },
                    { label: 'Staff', icon: Users, count: 'Manage', href: '/employee' },
                ]}
                shortcuts={[
                    { label: 'Add New Center', href: '/branch/new' },
                    { label: 'View Map', href: '/branch-map' },
                ]}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                            <Building size={18} className="text-orange-600" />
                            Active Study Centers
                        </h3>
                        <Link to="/branch" className="text-blue-600 text-[12px] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {centers.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-[13px]">No study centers found.</div>
                        ) : (
                            centers.map((center, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-orange-50 text-orange-600 rounded">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1d2129]">{center.branch || center.name || 'Center Name'}</p>
                                            <p className="text-[11px] text-gray-500">{center.address || 'No address provided'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Link to={`/branch/${center.name}`} className="text-[11px] font-bold text-blue-600 hover:underline">View Details</Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[16px] font-bold mb-4">Center Management</h4>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/branch/new" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-[13px] font-medium backdrop-blur-sm transition-colors no-underline">
                            Add New Center
                        </Link>
                    </div>
                </div>
                <Building className="absolute right-[-20px] bottom-[-20px] text-white/10" size={120} />
            </div>
        </div>
    );
}
