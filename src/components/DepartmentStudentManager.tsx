import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, User, Lock, Search, Save, Check, AlertCircle, Eye, EyeOff, ChevronRight, Users, BookOpen, UserCheck, Building2, CheckCircle } from 'lucide-react';

interface DepartmentStudentManagerProps {
    departmentId?: string;
    organizationId?: string;
    title?: string;
    description?: string;
}

export default function DepartmentStudentManager({ departmentId, organizationId: propOrgId, title, description }: DepartmentStudentManagerProps) {
    const [students, setStudents] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [counselors, setCounselors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [inputs, setInputs] = useState<Record<string, { username?: string, password?: string }>>({});

    // Visibility/UI States
    const [showCreate, setShowCreate] = useState(false);
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [studyCenters, setStudyCenters] = useState<any[]>([]);
    const [selectedCenter, setSelectedCenter] = useState<string>('');

    const [saving, setSaving] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const storedOrgId = localStorage.getItem('organization_id');
    const organizationId = propOrgId || ((storedOrgId === 'null' || storedOrgId === 'undefined') ? undefined : (storedOrgId || undefined));

    const [newStudent, setNewStudent] = useState({
        studentName: '',
        email: '',
        phone: '',
        qualification: '',
        status: 'Inquiry',
        program: '',
        counselorId: '', // Employee ID
        username: '',
        password: ''
    });

    useEffect(() => {
        fetchData();
    }, [departmentId, organizationId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const userRole = localStorage.getItem('user_role');
            const orgId = organizationId || localStorage.getItem('organization_id');

            if (!orgId) {
                console.error('[DepartmentStudentManager] No organizationId found!');
                setError('Organization ID not found. Please log in again.');
                setLoading(false);
                return;
            }

            const isGlobal = userRole === 'HR' || userRole === 'SuperAdmin' || userRole === 'OrganizationAdmin' || userRole === 'Operations';

            let query = `organizationId=${orgId}`;
            if (departmentId && !isGlobal) {
                query += `&departmentId=${departmentId}`;
            }

            console.log('[DepartmentStudentManager] Fetching with query:', query, 'userRole:', userRole);

            const [resStudents, resPrograms, resCounselors, resCenters] = await Promise.all([
                fetch(`/api/resource/student?${query}`),
                fetch(`/api/resource/program?organizationId=${orgId}`),
                fetch(`/api/resource/employee?${query}`),
                fetch(`/api/resource/studycenter?organizationId=${orgId}`)
            ]);

            const [dataStudents, dataPrograms, dataCounselors, dataCenters] = await Promise.all([
                resStudents.json(), resPrograms.json(), resCounselors.json(), resCenters.json()
            ]);

            console.log('[DepartmentStudentManager] Students loaded:', dataStudents.data?.length || 0);

            setStudents(dataStudents.data || []);
            setPrograms(dataPrograms.data || []);
            setCounselors(dataCounselors.data || []);
            setStudyCenters(dataCenters.data || []);
        } catch (e) {
            console.error('[DepartmentStudentManager] Error:', e);
            setError('Failed to load student data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCreds = async (studentId: string) => {
        const input = inputs[studentId];
        if (!input || (!input.username && !input.password)) return;

        setSaving(studentId);
        try {
            const res = await fetch(`/api/resource/student/${studentId}?organizationId=${organizationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(input.username ? { username: input.username } : {}),
                    ...(input.password ? { password: input.password } : {})
                })
            });

            if (res.ok) {
                setSuccess(studentId);
                setStudents(prev => prev.map(s => s._id === studentId ? { ...s, ...input } : s));
                setInputs(prev => {
                    const next = { ...prev };
                    delete next[studentId];
                    return next;
                });
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError('Failed to update credentials');
            }
        } catch (e) {
            setError('Connection error');
        } finally {
            setSaving(null);
        }
    };

    const handleVerify = async (studentId: string) => {
        if (!confirm('Verify this student record for Finance?')) return;
        setSaving(studentId);
        try {
            const res = await fetch(`/api/resource/student/${studentId}?organizationId=${organizationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verificationStatus: 'Verified by Ops' })
            });

            if (res.ok) {
                setStudents(prev => prev.map(s => s._id === studentId ? { ...s, verificationStatus: 'Verified by Ops' } : s));
                setSuccess(studentId);
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (e) {
            setError('Verification failed');
        } finally {
            setSaving(null);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const counselor = counselors.find(c => c._id === newStudent.counselorId);
            const payload = {
                ...newStudent,
                counselorName: counselor?.employeeName || '',
                organizationId,
                departmentId
            };

            const res = await fetch(`/api/resource/student?organizationId=${organizationId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                setStudents([...students, data.data]);
                setShowCreate(false);
                setNewStudent({
                    studentName: '', email: '', phone: '', qualification: '',
                    status: 'Inquiry', program: '', counselorId: '',
                    username: '', password: ''
                });
                setSuccess('new-student');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                const err = await res.json();
                setError(err.error || 'Failed to create student');
            }
        } catch (e) {
            setError('Creation failed');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Filter students by search and study center
    const filteredStudents = students.filter(s => {
        const matchesSearch = s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase()) ||
            s.program?.toLowerCase().includes(search.toLowerCase());

        const matchesCenter = selectedCenter === '' || s.studyCenter === selectedCenter;

        return matchesSearch && matchesCenter;
    });

    // Tree Rendering: Program -> Counselor -> Students
    const renderHierarchy = () => {
        const programsInView = Array.from(new Set(filteredStudents.map(s => s.program || 'Unassigned Program')));

        return (
            <div className="space-y-4 p-4">
                {programsInView.map(progName => {
                    const progStudents = filteredStudents.filter(s => (s.program || 'Unassigned Program') === progName);
                    const counselorsInProg = Array.from(new Set(progStudents.map(s => s.counselorId || 'Unassigned Counselor')));
                    const isProgExpanded = expanded[progName];

                    return (
                        <div key={progName} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                            <div
                                className="p-3 bg-gray-50/50 flex items-center justify-between cursor-pointer hover:bg-gray-100/50 transition-colors"
                                onClick={() => toggleExpand(progName)}
                            >
                                <div className="flex items-center gap-3">
                                    <ChevronRight size={16} className={`text-gray-400 transition-transform ${isProgExpanded ? 'rotate-90' : ''}`} />
                                    <BookOpen size={18} className="text-violet-500" />
                                    <span className="font-bold text-[#1d2129] text-[14px]">{progName}</span>
                                    <span className="text-[10px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded font-bold">{progStudents.length} APPLICATIONS</span>
                                </div>
                            </div>

                            {isProgExpanded && (
                                <div className="ml-6 border-l border-gray-100 pl-4 py-2 space-y-3">
                                    {counselorsInProg.map(cId => {
                                        const cName = progStudents.find(s => s.counselorId === cId)?.counselorName || 'Unassigned Counselor';
                                        const counselorStudents = progStudents.filter(s => s.counselorId === cId);
                                        const counselorKey = `${progName}-${cId}`;
                                        const isCounselorExpanded = expanded[counselorKey];

                                        return (
                                            <div key={cId} className="space-y-2">
                                                <div
                                                    className="flex items-center gap-2 cursor-pointer group"
                                                    onClick={() => toggleExpand(counselorKey)}
                                                >
                                                    <ChevronRight size={12} className={`text-gray-300 transition-transform ${isCounselorExpanded ? 'rotate-90' : ''}`} />
                                                    <UserCheck size={14} className="text-emerald-500" />
                                                    <span className="text-[12px] font-bold text-gray-600 group-hover:text-emerald-600">Counselor: {cName}</span>
                                                    <span className="text-[10px] text-gray-400">({counselorStudents.length})</span>
                                                </div>

                                                {isCounselorExpanded && (
                                                    <div className="ml-4 space-y-2">
                                                        {counselorStudents.map(student => (
                                                            <div key={student._id} className="p-3 bg-white border border-gray-50 rounded-lg flex items-center justify-between group hover:border-blue-100 hover:shadow-sm transition-all">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                                                        {student.studentName?.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="font-bold text-[13px] text-[#1d2129]">{student.studentName}</span>
                                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${student.status === 'Admitted' ? 'bg-emerald-50 text-emerald-600' :
                                                                                student.status === 'Registered' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                                                                                }`}>
                                                                                {student.status}
                                                                            </span>
                                                                            {/* Show study center tag */}
                                                                            {student.studyCenter && (
                                                                                <span className="text-[9px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 flex items-center gap-1">
                                                                                    <Building2 size={10} /> {student.studyCenter}
                                                                                </span>
                                                                            )}
                                                                            {/* Verification Status Badge */}
                                                                            {student.verificationStatus && student.verificationStatus !== 'Processing' && (
                                                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border flex items-center gap-1 ${student.verificationStatus === 'Approved by Accounts' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                                    student.verificationStatus === 'Verified by Ops' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                                        'bg-orange-50 text-orange-700 border-orange-100'
                                                                                    }`}>
                                                                                    <CheckCircle size={10} /> {student.verificationStatus}
                                                                                </span>
                                                                            )}
                                                                            {/* Show department tag for HR/Admin */}
                                                                            {(localStorage.getItem('user_role') === 'HR' || localStorage.getItem('user_role') === 'SuperAdmin') && student.departmentId && (
                                                                                <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">Dept ID: {student.departmentId.slice(-4)}</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-[11px] text-gray-400">{student.email} • {student.phone || 'No phone'}</div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-2 pr-2 border-r border-gray-100">
                                                                        <Link
                                                                            to={`/student/${student._id}`}
                                                                            className="p-1.5 bg-gray-50 text-gray-400 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                                            title="View Student Details"
                                                                        >
                                                                            <Eye size={14} />
                                                                        </Link>
                                                                        {(localStorage.getItem('user_role') === 'Operations' || localStorage.getItem('user_role') === 'SuperAdmin') &&
                                                                            (student.verificationStatus === 'Pending' || student.verificationStatus === 'Processing') && (
                                                                                <button
                                                                                    onClick={() => handleVerify(student._id)}
                                                                                    disabled={saving === student._id}
                                                                                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100"
                                                                                    title="Verify Record"
                                                                                >
                                                                                    <Check size={14} />
                                                                                </button>
                                                                            )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="relative">
                                                                            <User size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                                                            <input
                                                                                value={inputs[student._id]?.username ?? ''}
                                                                                placeholder={student.username || "Set username"}
                                                                                onChange={e => setInputs(prev => ({ ...prev, [student._id]: { ...prev[student._id], username: e.target.value } }))}
                                                                                className="pl-6 pr-2 py-1 bg-gray-50/50 border border-gray-100 rounded text-[11px] w-28 focus:outline-none focus:border-blue-400 bg-white"
                                                                            />
                                                                        </div>
                                                                        <div className="relative">
                                                                            <Lock size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                                                            <input
                                                                                type={visiblePasswords[student._id] ? "text" : "password"}
                                                                                value={inputs[student._id]?.password ?? ''}
                                                                                placeholder={student.password ? "••••••" : "Set password"}
                                                                                onChange={e => setInputs(prev => ({ ...prev, [student._id]: { ...prev[student._id], password: e.target.value } }))}
                                                                                className="pl-6 pr-6 py-1 bg-gray-50/50 border border-gray-100 rounded text-[11px] w-28 focus:outline-none focus:border-blue-400 bg-white"
                                                                            />
                                                                            <button
                                                                                onClick={() => setVisiblePasswords(prev => ({ ...prev, [student._id]: !prev[student._id] }))}
                                                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                                                                            >
                                                                                {visiblePasswords[student._id] ? <EyeOff size={10} /> : <Eye size={10} />}
                                                                            </button>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleSaveCreds(student._id)}
                                                                            disabled={saving === student._id || (!inputs[student._id]?.username && !inputs[student._id]?.password)}
                                                                            className={`p-1.5 rounded transition-all ${success === student._id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'} disabled:opacity-30`}
                                                                        >
                                                                            {saving === student._id ? <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent animate-spin rounded-full" /> :
                                                                                success === student._id ? <Check size={14} /> : <Save size={14} />}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden mt-8">
            <div className="p-4 border-b border-[#d1d8dd] bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="flex items-center gap-2 font-bold text-[#1d2129]">
                        <GraduationCap size={18} className="text-violet-600" />
                        {title || 'STUDENT Hierarchy & Support'}
                    </h3>
                    <p className="text-[12px] text-gray-500 mt-1">{description || 'Manage student lifecycles and counselor assignments.'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search students..."
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-blue-400 w-full md:w-64"
                        />
                    </div>

                    {/* Center Filter */}
                    <div className="relative">
                        <select
                            value={selectedCenter}
                            onChange={(e) => setSelectedCenter(e.target.value)}
                            className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-blue-400 w-full md:w-48 appearance-none font-medium text-gray-700"
                        >
                            <option value="">All Study Centers</option>
                            {studyCenters.map(c => (
                                <option key={c._id} value={c.centerName}>{c.centerName}</option>
                            ))}
                        </select>
                        <Building2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {localStorage.getItem('user_role') !== 'Operations' && localStorage.getItem('user_role') !== 'DepartmentAdmin' && (
                        <button
                            onClick={() => setShowCreate(!showCreate)}
                            className="bg-violet-600 text-white px-3 py-2 rounded-lg text-[13px] font-bold hover:bg-violet-700 flex items-center gap-1 shadow-sm"
                        >
                            <Users size={14} /> Add STUDENT
                        </button>
                    )}
                </div>
            </div>

            {showCreate && (
                <div className="p-6 bg-violet-50/40 border-b border-violet-100 animate-in slide-in-from-top-2">
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5"><User size={12} /> STUDENT Name</label>
                                <input required value={newStudent.studentName} onChange={e => setNewStudent({ ...newStudent, studentName: e.target.value })} className="w-full text-[13px] p-2.5 border rounded-lg shadow-sm focus:border-violet-400 outline-none bg-white transition-all" placeholder="e.g. John Doe" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5"><BookOpen size={12} /> Program</label>
                                <select required value={newStudent.program} onChange={e => setNewStudent({ ...newStudent, program: e.target.value })} className="w-full text-[13px] p-2.5 border rounded-lg h-[41px] shadow-sm focus:border-violet-400 outline-none bg-white transition-all">
                                    <option value="">Select Program...</option>
                                    {programs.map(p => (
                                        <option key={p._id} value={p.programName}>{p.programName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5"><UserCheck size={12} /> Assign Counselor</label>
                                <select required value={newStudent.counselorId} onChange={e => setNewStudent({ ...newStudent, counselorId: e.target.value })} className="w-full text-[13px] p-2.5 border rounded-lg h-[41px] shadow-sm focus:border-violet-400 outline-none bg-white transition-all">
                                    <option value="">Choose Mentor...</option>
                                    {counselors.map(c => (
                                        <option key={c._id} value={c._id}>{c.employeeName} ({c.designation})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">Status</label>
                                <select value={newStudent.status} onChange={e => setNewStudent({ ...newStudent, status: e.target.value as any })} className="w-full text-[13px] p-2.5 border rounded-lg h-[41px] shadow-sm focus:border-violet-400 outline-none bg-white transition-all">
                                    <option value="Inquiry">Inquiry</option>
                                    <option value="Verified">Verified</option>
                                    <option value="Registered">Registered</option>
                                    <option value="Admitted">Admitted</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-violet-100 pt-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-600">Portal Username</label>
                                <input required value={newStudent.username} onChange={e => setNewStudent({ ...newStudent, username: e.target.value })} className="w-full text-[13px] p-2.5 border rounded-lg shadow-sm focus:border-violet-400 outline-none bg-white transition-all" placeholder="johndoe123" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-600">Portal Password</label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showCreatePassword ? "text" : "password"}
                                        value={newStudent.password}
                                        onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
                                        className="w-full text-[13px] p-2.5 border rounded-lg pr-10 shadow-sm focus:border-violet-400 outline-none bg-white transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-6">
                                <button type="submit" className="bg-violet-600 text-white px-8 py-2.5 rounded-lg text-[13px] font-bold hover:bg-violet-700 shadow-lg hover:shadow-violet-200 transition-all flex-1 flex items-center justify-center gap-2">
                                    <Check size={16} /> Enroll STUDENT
                                </button>
                                <button type="button" onClick={() => setShowCreate(false)} className="bg-white border border-gray-200 text-gray-500 px-8 py-2.5 rounded-lg text-[13px] font-bold hover:bg-gray-50 flex-1 transition-all">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="min-h-[400px]">
                {loading ? (
                    <div className="py-24 text-center">
                        <div className="w-8 h-8 border-4 border-violet-100 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400 italic text-[13px]">Mapping student success paths...</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="py-32 text-center text-gray-400 italic">
                        <Users size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-[13px]">No records found matching your scope.</p>
                    </div>
                ) : (
                    renderHierarchy()
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 text-[12px] p-4 text-center border-t border-red-100 flex items-center justify-center gap-2">
                    <AlertCircle size={16} />
                    <span className="font-medium">{error}</span>
                </div>
            )}
        </div>
    );
}
