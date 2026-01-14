
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Workspace from '../components/Workspace';
import { Activity, Shield, Users, FileText, BadgeDollarSign, Receipt, School, BookOpen, UserCheck, CalendarDays, Megaphone, GraduationCap, Building2 } from 'lucide-react';
import DepartmentStudentManager from '../components/DepartmentStudentManager';

export default function DepartmentPanel() {
    const { id } = useParams();
    const [dept, setDept] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        async function fetchDept() {
            try {
                const orgId = localStorage.getItem('organization_id');
                const res = await fetch(`/api/resource/department/${id}?organizationId=${orgId}`);
                const data = await res.json();
                setDept(data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchDept();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-400">Loading workspace...</div>;
    if (!dept) return <div className="p-8 text-center text-red-500">Workspace not found.</div>;

    const hasFeature = (f: string) => dept.features?.includes(f);

    // Dynamic Cards Construction
    const masterCards = [];
    const shortcuts = [];
    const summaryItems = [
        { label: 'Staff Member', value: '12', color: 'text-blue-600', doctype: 'employee' }
    ];

    // HR Features
    if (hasFeature('Attendance')) {
        masterCards.push({
            label: 'Attendance',
            count: '',
            icon: CalendarDays,
            href: '/attendance',
            color: 'bg-emerald-50 text-emerald-600'
        });
        shortcuts.push({ label: 'Mark Attendance', href: '/attendance/new' });
        summaryItems.push({ label: 'Present Today', value: '45', color: 'text-emerald-600', doctype: 'attendance' });
    }
    if (hasFeature('Recruitment')) {
        masterCards.push({
            label: 'Recruitment',
            count: '',
            icon: UserCheck,
            href: '/job-opening',
            color: 'bg-purple-50 text-purple-600'
        });
        shortcuts.push({ label: 'Post Job', href: '/job-opening/new' });
    }
    if (hasFeature('Payroll')) {
        shortcuts.push({ label: 'Process Payroll', href: '/payroll' });
    }
    if (hasFeature('Employee Lifecycle')) shortcuts.push({ label: 'Manage Lifecycle', href: '/employee-lifecycle' });
    if (hasFeature('Shift Management')) shortcuts.push({ label: 'Manage Shifts', href: '/shift-management' });
    if (hasFeature('Holidays')) {
        masterCards.push({ label: 'Holidays', count: '', icon: CalendarDays, href: '/holiday', color: 'bg-orange-50 text-orange-600' });
        shortcuts.push({ label: 'Add Holiday', href: '/holiday/new' });
    }
    if (hasFeature('Announcements')) {
        masterCards.push({ label: 'Announcements', count: '', icon: Megaphone, href: '/announcement', color: 'bg-blue-50 text-blue-600' });
        shortcuts.push({ label: 'Post Announcement', href: '/announcement/new' });
    }

    // Finance Features
    if (hasFeature('Invoices')) {
        masterCards.push({
            label: 'Invoices',
            count: '',
            icon: FileText,
            href: '/salesinvoice',
            color: 'bg-orange-50 text-orange-600'
        });
        shortcuts.push({ label: 'New Invoice', href: '/salesinvoice/new' });
    }
    if (hasFeature('Payments')) {
        masterCards.push({
            label: 'Payments',
            count: '',
            icon: BadgeDollarSign,
            href: '/paymententry',
            color: 'bg-green-50 text-green-600'
        });
        shortcuts.push({ label: 'Record Payment', href: '/paymententry/new' });
    }
    if (hasFeature('Expenses')) {
        masterCards.push({
            label: 'Expenses',
            count: '',
            icon: Receipt,
            href: '/expenseclaim',
            color: 'bg-red-50 text-red-600'
        });
        shortcuts.push({ label: 'File Claim', href: '/expenseclaim/new' });
    }
    if (hasFeature('General Ledger')) masterCards.push({ label: 'General Ledger', count: '', icon: BookOpen, href: '/general-ledger', color: 'bg-gray-50 text-gray-600' });
    if (hasFeature('Taxation')) shortcuts.push({ label: 'Tax Reports', href: '/taxation' });
    if (hasFeature('Quotations')) {
        masterCards.push({ label: 'Quotations', count: '', icon: FileText, href: '/quotation', color: 'bg-indigo-50 text-indigo-600' });
        shortcuts.push({ label: 'New Quotation', href: '/quotation/new' });
    }
    if (hasFeature('Sales Orders')) {
        masterCards.push({ label: 'Sales Orders', count: '', icon: FileText, href: '/salesorder', color: 'bg-blue-50 text-blue-600' });
        shortcuts.push({ label: 'New Sales Order', href: '/salesorder/new' });
    }

    // Operations Features
    if (hasFeature('University')) {
        masterCards.push({ label: 'Universities', count: '', icon: School, href: '/university', color: 'bg-indigo-50 text-indigo-600' });
    }
    if (hasFeature('Study Center')) {
        masterCards.push({ label: 'Study Centers', count: '', icon: BookOpen, href: '/studycenter', color: 'bg-cyan-50 text-cyan-600' });
    }
    if (hasFeature('Applications')) masterCards.push({ label: 'Applications', count: '', icon: FileText, href: '/applications', color: 'bg-teal-50 text-teal-600' });
    if (hasFeature('Student Records')) shortcuts.push({ label: 'Student Directory', href: '/student-list' });
    if (hasFeature('Programs')) {
        masterCards.push({ label: 'Programs', count: '', icon: GraduationCap, href: '/program', color: 'bg-violet-50 text-violet-600' });
        shortcuts.push({ label: 'Create Program', href: '/program/new' });
    }

    // New Modules Logic

    // Inventory
    if (hasFeature('Stock Entry')) {
        masterCards.push({ label: 'Stock Entries', count: '', icon: FileText, href: '/stockentry', color: 'bg-amber-50 text-amber-600' });
        shortcuts.push({ label: 'New Stock Entry', href: '/stockentry/new' });
    }
    if (hasFeature('Delivery Note')) shortcuts.push({ label: 'Create Delivery Note', href: '/deliverynote/new' });
    if (hasFeature('Item Management')) shortcuts.push({ label: 'Add Item', href: '/item/new' });
    if (hasFeature('Purchase Receipt')) shortcuts.push({ label: 'Create Receipt', href: '/purchase-receipt/new' });
    if (hasFeature('Warehouses')) shortcuts.push({ label: 'Manage Warehouses', href: '/warehouse' });
    if (hasFeature('Suppliers')) {
        masterCards.push({ label: 'Suppliers', count: '', icon: Building2, href: '/supplier', color: 'bg-slate-50 text-slate-600' });
        shortcuts.push({ label: 'Add Supplier', href: '/supplier/new' });
    }

    // CRM
    if (hasFeature('Leads')) {
        masterCards.push({ label: 'Leads', count: '', icon: Users, href: '/lead', color: 'bg-blue-50 text-blue-600' });
        shortcuts.push({ label: 'Add Lead', href: '/lead/new' });
    }
    if (hasFeature('Deals')) shortcuts.push({ label: 'New Deal', href: '/deal/new' });
    if (hasFeature('Customers')) masterCards.push({ label: 'Customers', count: '', icon: Users, href: '/customer', color: 'bg-sky-50 text-sky-600' });
    if (hasFeature('Touchpoints')) shortcuts.push({ label: 'Log Touchpoint', href: '/touchpoint' });

    // Projects
    if (hasFeature('Projects')) {
        masterCards.push({ label: 'Projects', count: '', icon: FileText, href: '/project', color: 'bg-pink-50 text-pink-600' });
    }
    if (hasFeature('Tasks')) shortcuts.push({ label: 'Create Task', href: '/task/new' });
    if (hasFeature('Timesheets')) masterCards.push({ label: 'Timesheets', count: '', icon: CalendarDays, href: '/timesheet', color: 'bg-rose-50 text-rose-600' });
    if (hasFeature('Agile Board')) shortcuts.push({ label: 'Go to Board', href: '/agile-board' });

    // Helpdesk
    if (hasFeature('Tickets')) {
        masterCards.push({ label: 'Support Tickets', count: '', icon: Shield, href: '/ticket', color: 'bg-cyan-50 text-cyan-600' });
        shortcuts.push({ label: 'Raise Ticket', href: '/ticket/new' });
    }
    if (hasFeature('Issues')) masterCards.push({ label: 'Issues', count: '', icon: Activity, href: '/issue', color: 'bg-red-50 text-red-600' });
    if (hasFeature('Warranty Claims')) shortcuts.push({ label: 'Warranty Claims', href: '/warranty' });
    if (hasFeature('Knowledge Base')) shortcuts.push({ label: 'Knowledge Base', href: '/kb' });

    // Assets
    if (hasFeature('Asset Tracking')) {
        masterCards.push({ label: 'Assets', count: '', icon: BadgeDollarSign, href: '/asset', color: 'bg-slate-50 text-slate-600' });
        shortcuts.push({ label: 'Register Asset', href: '/asset/new' });
    }
    if (hasFeature('Maintenance')) masterCards.push({ label: 'Maintenance', count: '', icon: Activity, href: '/maintenance', color: 'bg-yellow-50 text-yellow-600' });
    if (hasFeature('Depreciation')) shortcuts.push({ label: 'View Depreciation', href: '/depreciation' });

    // Generate Dynamic Scope Description
    const getScopeSummary = () => {
        const modules = [];
        const f = dept.features || [];

        if (f.some((x: string) => ['Attendance', 'Recruitment', 'Payroll', 'Employee Lifecycle'].includes(x))) modules.push('HR & Payroll');
        if (f.some((x: string) => ['Invoices', 'Deep', 'General Ledger'].includes(x))) modules.push('Finance');
        if (f.some((x: string) => ['Stock Entry', 'Warehouses', 'Item Management', 'Suppliers'].includes(x))) modules.push('Inventory');
        if (f.some((x: string) => ['Leads', 'Deals', 'Customers'].includes(x))) modules.push('CRM');
        if (f.some((x: string) => ['Projects', 'Tasks', 'Timesheets'].includes(x))) modules.push('Projects');
        if (f.some((x: string) => ['Tickets', 'Issues'].includes(x))) modules.push('Helpdesk');
        if (f.some((x: string) => ['Asset Tracking', 'Maintenance'].includes(x))) modules.push('Assets');
        if (f.some((x: string) => ['University', 'Study Center'].includes(x))) modules.push('Education Ops');

        if (modules.length === 0) return "This workspace has a custom feature set.";
        if (modules.length === 1) return `This workspace is dedicated to ${modules[0]} functions.`;
        return `This workspace handles ${modules.join(', ')} functionalities.`;
    };

    return (
        <div className="space-y-8">
            <Workspace
                title={`${dept.name} Workspace`}
                summaryItems={summaryItems}
                masterCards={masterCards}
                shortcuts={shortcuts}
            />

            <div className="max-w-6xl mx-auto px-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mb-8 shadow-sm flex flex-col md:flex-row md:items-start gap-4">
                    <div className="p-3 bg-white rounded-full text-blue-600 shadow-sm shrink-0">
                        <Activity size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-[16px] font-bold text-gray-900 mb-2">Functional Scope & Capabilities</h4>
                        <p className="text-[14px] text-gray-600 leading-relaxed mb-4">
                            {dept.description || getScopeSummary()}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {dept.features?.map((f: string) => (
                                <span key={f} className="text-[11px] font-semibold bg-white text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Student Management Section (If Education module) */}
                {(hasFeature('Student Records') || hasFeature('Applications')) && (
                    <DepartmentStudentManager
                        departmentId={id}
                        title={`${dept?.name} Student Management`}
                        description="Hierarchical view of students by program and counselor."
                    />
                )}
            </div>
        </div>
    );
}
