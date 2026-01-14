import React, { useEffect, useState } from 'react';
import { School, Building2, BookOpen, GraduationCap, FileCheck, TrendingUp } from 'lucide-react';
import Workspace from '../components/Workspace';
import { Link } from 'react-router-dom';
import DepartmentStaffManager from '../components/DepartmentStaffManager';
import DepartmentStudentManager from '../components/DepartmentStudentManager';

export default function OpsDashboard() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCounts() {
            try {
                const orgId = localStorage.getItem('organization_id');
                const deptId = localStorage.getItem('department_id');
                const userRole = localStorage.getItem('user_role');

                let baseUrl = `/api/resource`;
                let queryParams = `?organizationId=${orgId || ''}`;

                const isGlobalRole = userRole === 'SuperAdmin' || userRole === 'OrganizationAdmin' || userRole === 'HR';
                if (deptId && !isGlobalRole) {
                    queryParams += `&departmentId=${deptId}`;
                }

                const [resUni, resStd, resApp, resCen] = await Promise.all([
                    fetch(`${baseUrl}/university${queryParams}`),
                    fetch(`${baseUrl}/student${queryParams}`),
                    fetch(`${baseUrl}/application${queryParams}`),
                    fetch(`${baseUrl}/studycenter${queryParams}`)
                ]);
                const [jsonUni, jsonStd, jsonApp, jsonCen] = await Promise.all([
                    resUni.json(), resStd.json(), resApp.json(), resCen.json()
                ]);

                setCounts({
                    university: jsonUni.data?.length || 0,
                    student: jsonStd.data?.length || 0,
                    application: jsonApp.data?.length || 0,
                    studycenter: jsonCen.data?.length || 0
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchCounts();
    }, []);

    return (
        <div className="space-y-8 pb-20 text-[#1d2129]">
            <Workspace
                title="Operations Workspace"
                newHref="/application/new"
                summaryItems={[
                    { label: 'Active Applications', value: loading ? '...' : counts.application || 0, color: 'text-blue-500', doctype: 'application' },
                    { label: 'Total Students', value: loading ? '...' : counts.student || 0, color: 'text-emerald-500', doctype: 'student' },
                    { label: 'Partner Universities', value: loading ? '...' : counts.university || 0, color: 'text-orange-500', doctype: 'university' },
                ]}
                masterCards={[
                    { label: 'Universities', icon: School, count: '', href: '/university' },
                    { icon: Building2, label: 'Study Centers', count: '', href: '/studycenter' },
                    { icon: BookOpen, label: 'Programs', count: '', href: '/program' },
                    { icon: GraduationCap, label: 'Students', count: '', href: '/student' },
                    { icon: FileCheck, label: 'Applications', count: '', href: '/application' },
                ]}
                shortcuts={[
                    { label: 'New Application', href: '/application/new' },
                    { label: 'Add University', href: '/university/new' },
                ]}
            />

            <div className="max-w-6xl mx-auto">
                <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-600" />
                    Admission Trends
                </h3>
                <div className="p-10 bg-white border-dashed border-2 border-gray-100 rounded-xl flex flex-col items-center justify-center min-h-[300px]">
                    <GraduationCap size={48} className="text-gray-100 mb-4" />
                    <p className="text-gray-400 font-medium">Monthly Enrollment Analytics</p>
                    <p className="text-[12px] text-gray-300">Data visualization module connecting...</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto space-y-8">
                <DepartmentStaffManager
                    departmentId={localStorage.getItem('department_id') || undefined}
                    title="Operations Team Access"
                    description="Manage credentials for operations staff."
                />

                <DepartmentStudentManager
                    departmentId={localStorage.getItem('department_id') || undefined}
                    title="Student Enrollment & Support"
                    description="Hierarchical view of students and assigned mentors."
                />
            </div>
        </div>
    );
}
