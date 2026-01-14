import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { fieldRegistry } from '../config/fields';

export default function GenericList() {
    const { doctype } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const displayTitle = (doctype as string || '').replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

    useEffect(() => {
        if (!doctype) return;
        setLoading(true);
        const orgId = localStorage.getItem('organization_id');
        const deptId = localStorage.getItem('department_id');
        const userRole = localStorage.getItem('user_role');

        let url = `/api/resource/${doctype}?organizationId=${orgId || ''}`;
        if (deptId && userRole !== 'SuperAdmin' && userRole !== 'OrganizationAdmin' && userRole !== 'HR') {
            url += `&departmentId=${deptId}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(json => {
                setData(json.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Fetch error:', err);
                setLoading(false);
            });
    }, [doctype]);

    const handleRowClick = (id: string) => {
        navigate(`/${doctype}/${id}`);
    };

    return (
        <div className="pb-20 text-[#1d2129]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-200 rounded">
                        <ArrowLeft size={18} className="text-gray-500" />
                    </button>
                    <h2 className="text-[20px] font-bold">{displayTitle} List</h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.location.reload()} className="bg-white border border-[#d1d8dd] px-3 py-1.5 rounded text-[13px] font-semibold hover:bg-gray-50">
                        Refresh
                    </button>
                    {doctype !== 'student' && doctype !== 'complaint' && (
                        <button
                            onClick={() => navigate(`/${doctype}/new`)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded text-[13px] font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={14} />
                            Add {displayTitle}
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm border border-[#d1d8dd] rounded-lg">
                <div className="p-3 border-b border-[#d1d8dd] bg-[#f9fafb] flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-1.5 bg-white border border-[#d1d8dd] rounded text-[13px] focus:outline-none focus:border-blue-400"
                        />
                    </div>
                    <button className="flex items-center gap-2 text-[13px] text-[#626161] hover:text-blue-600 font-medium px-2 py-1">
                        <Filter size={14} />
                        Filter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                        <thead>
                            <tr className="bg-[#f0f4f7] border-b border-[#d1d8dd] text-[#8d99a6] font-bold uppercase tracking-wider">
                                <th className="px-4 py-2 w-10"><input type="checkbox" className="rounded" /></th>
                                <th className="px-4 py-2">Name</th>
                                {doctype === 'employee' && <th className="px-4 py-2">Department</th>}
                                {doctype === 'employee' && <th className="px-4 py-2">Reports To</th>}
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Last Modified</th>
                                <th className="px-4 py-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic">Fetching records...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic">No records found.</td></tr>
                            ) : (
                                data.map((item, idx) => (
                                    <tr
                                        key={idx}
                                        onClick={() => handleRowClick(item._id)}
                                        className="hover:bg-[#f9fafb] cursor-pointer group transition-colors"
                                    >
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded" /></td>
                                        <td className="px-4 py-3 font-medium text-blue-600 hover:underline">
                                            {item.name || item.holidayName || item.universityName || item.centerName || item.programName || item.employeeName || item.studentName || item.student || item._id}
                                        </td>
                                        {doctype === 'employee' && (
                                            <td className="px-4 py-3 text-[#1d2129]">
                                                {item.department || '-'}
                                            </td>
                                        )}
                                        {doctype === 'employee' && (
                                            <td className="px-4 py-3 text-[#1d2129]">
                                                {item.reportsToRole || (item.reportsTo?.employeeName ? item.reportsTo.employeeName : '-')}
                                            </td>
                                        )}
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${item.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                item.status === 'Left' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-[#626161]'
                                                }`}>
                                                {item.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[#8d99a6]">
                                            {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Today'}
                                        </td>
                                        <td className="px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal size={16} className="text-gray-400 hover:text-blue-600" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
