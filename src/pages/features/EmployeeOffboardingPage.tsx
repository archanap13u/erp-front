import React, { useState, useEffect } from 'react';
import { UserMinus, AlertTriangle, Save, ArrowLeft, Search, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Workspace from '../../components/Workspace';

export default function EmployeeOffboardingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

    const [formData, setFormData] = useState({
        exitDate: new Date().toISOString().split('T')[0],
        exitType: 'Resignation', // Resignation, Termination, Absconded, Retirement
        reason: '',
        revokeAccess: true
    });

    useEffect(() => {
        const orgId = localStorage.getItem('organization_id');
        // Fetch Active Employees
        fetch(`/api/resource/employee?organizationId=${orgId}&status=Active`)
            .then(res => res.json())
            .then(json => setEmployees(json.data || []))
            .catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!window.confirm('Are you sure you want to process this exit? This will deactivate the employee record.')) {
            return;
        }

        setLoading(true);

        try {
            // Update fields to mark as exited
            const updatePayload: any = {
                status: 'Left', // Or 'Exited'
                exitDate: formData.exitDate,
                exitType: formData.exitType,
                exitReason: formData.reason,
            };

            if (formData.revokeAccess) {
                updatePayload.isActive = false;
                updatePayload.password = null; // Clear password
                updatePayload.username = `EXITED_${Date.now()}_${selectedEmployeeId.slice(-4)}`; // Scramble username to free it up or just lock it
            }

            const res = await fetch(`/api/resource/employee/${selectedEmployeeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload)
            });

            if (res.ok) {
                alert('Employee offboarding processed successfully. Access revoked.');
                navigate('/employee');
            } else {
                const json = await res.json();
                alert('Error: ' + (json.error || 'Failed to offboard employee'));
            }
        } catch (err) {
            console.error(err);
            alert('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const selectedEmployee = employees.find(e => e._id === selectedEmployeeId);

    return (
        <div className="space-y-8 pb-20 text-[#1d2129]">
            <Workspace
                title="Employee Offboarding"
                newHref="/employee"
                newLabel=""
                summaryItems={[]}
                masterCards={[]}
                shortcuts={[]}
            />

            <div className="max-w-4xl mx-auto bg-white rounded-xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#d1d8dd] bg-red-50/50 flex items-center justify-between">
                    <h3 className="text-[18px] font-bold text-[#1d2129] flex items-center gap-2">
                        <UserMinus size={20} className="text-red-600" />
                        Process Exit & Revoke Access
                    </h3>
                    <Link to="/employee" className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-[13px]">
                        <ArrowLeft size={16} /> Cancel
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* 1. Select Employee */}
                    <div>
                        <label className="text-[13px] font-bold text-gray-900 mb-2 block">Select Employee to Offboard</label>
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <select
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedEmployeeId}
                                onChange={e => setSelectedEmployeeId(e.target.value)}
                            >
                                <option value="">-- Search Active Employee --</option>
                                {employees.map(e => (
                                    <option key={e._id} value={e._id}>{e.employeeName} ({e.department})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {selectedEmployeeId && (
                        <div className="bg-red-50 p-6 rounded-lg border border-red-100 flex items-start gap-4">
                            <div className="p-2 bg-white rounded-full text-red-600 shadow-sm">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h4 className="text-[14px] font-bold text-red-900 mb-1">Access Revocation Warning</h4>
                                <p className="text-[12px] text-red-700 leading-relaxed">
                                    You are about to process the exit for <strong>{selectedEmployee?.employeeName}</strong>.
                                    By default, this will immediately revoke their system access, disable their login, and mark their status as 'Left'.
                                    This action cannot be easily undone.
                                </p>
                            </div>
                        </div>
                    )}

                    {selectedEmployeeId && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[13px] font-medium text-gray-700">Exit Date <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="date"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.exitDate}
                                    onChange={e => setFormData({ ...formData, exitDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[13px] font-medium text-gray-700">Exit Type <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.exitType}
                                    onChange={e => setFormData({ ...formData, exitType: e.target.value })}
                                >
                                    <option value="Resignation">Resignation</option>
                                    <option value="Termination">Termination</option>
                                    <option value="Absconded">Absconded</option>
                                    <option value="Retirement">Retirement</option>
                                </select>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-[13px] font-medium text-gray-700">Reason / Remarks</label>
                                <textarea
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Optional exit remarks..."
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                        checked={formData.revokeAccess}
                                        onChange={e => setFormData({ ...formData, revokeAccess: e.target.checked })}
                                    />
                                    <span className="text-[13px] font-bold text-gray-900">Immediately Revoke System Access</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {selectedEmployeeId && (
                        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                            <Link to="/employee" className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-[13px] hover:bg-gray-50 transition-all">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 text-white font-bold text-[13px] hover:bg-red-700 transition-all disabled:opacity-50 shadow-sm"
                            >
                                {loading ? 'Processing...' : <><UserMinus size={16} /> Process Exit</>}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
