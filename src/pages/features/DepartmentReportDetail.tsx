import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Building2, UserCheck, Clock } from 'lucide-react';

export default function DepartmentReportDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [department, setDepartment] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const orgId = localStorage.getItem('organization_id');

                // Fetch department details
                const deptRes = await fetch(`/api/resource/department/${id}?organizationId=${orgId}`);
                const deptJson = await deptRes.json();

                if (deptJson.data) {
                    setDepartment(deptJson.data);

                    // Fetch employees for this department
                    const empRes = await fetch(`/api/resource/employee?organizationId=${orgId}`);
                    const empJson = await empRes.json();

                    const allEmployees = empJson.data || [];
                    // Filter mainly by department name for now as that's how it's often stored, 
                    // ideally should be by ID if the relationship is strict
                    const deptEmployees = allEmployees.filter((e: any) => e.department === deptJson.data.name);
                    setEmployees(deptEmployees);
                }
            } catch (error) {
                console.error("Failed to fetch department details", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading department details...</div>;
    }

    if (!department) {
        return <div className="p-8 text-center text-red-500">Department not found.</div>;
    }

    const activeCount = employees.filter(e => e.status === 'Active').length;
    const leaveCount = employees.filter(e => e.status === 'On Leave').length;

    return (
        <div className="space-y-8 pb-20 text-[#1d2129] animate-in slide-in-from-right-4">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {department.name} Report
                    </h1>
                    <p className="text-gray-500 text-sm">Detailed workforce analysis for {department.code}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase">Total Staff</p>
                            <p className="text-2xl font-bold">{employees.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase">Active</p>
                            <p className="text-2xl font-bold">{activeCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#d1d8dd] shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase">On Leave</p>
                            <p className="text-2xl font-bold">{leaveCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#f0f4f7] bg-[#f9fafb]">
                    <h3 className="font-bold text-gray-800">Employee List</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#f0f4f7] text-gray-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Designation</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date of Joining</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">No employees found in this department.</td>
                                </tr>
                            ) : (
                                employees.map((emp, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{emp.employeeName}</td>
                                        <td className="px-6 py-4 text-gray-600">{emp.designation}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                                    emp.status === 'On Leave' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : '-'}</td>
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
