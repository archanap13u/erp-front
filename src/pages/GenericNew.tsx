import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { fieldRegistry } from '../config/fields';

export default function GenericNew() {
    const { doctype } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [dynamicOptions, setDynamicOptions] = useState<{ [key: string]: { label: string, value: string }[] }>({});

    const fields = fieldRegistry[doctype as string] || [{ name: 'name', label: 'Name', type: 'text' }];
    const displayTitle = (doctype as string || '').replace(/([A-Z])/g, ' $1').trim();

    useEffect(() => {
        const orgId = localStorage.getItem('organization_id');
        if (!orgId) return;

        const fetchDynamicOptions = async () => {
            const options: { [key: string]: { label: string, value: string }[] } = {};
            for (const field of fields) {
                if (field.link) {
                    try {
                        const res = await fetch(`/api/resource/${field.link}?organizationId=${orgId}`);
                        const json = await res.json();
                        options[field.name] = (json.data || []).map((item: any) => ({
                            label: item.job_title || item.title || item.name || item.employeeName || item.studentName || item._id,
                            value: item._id || item.name
                        }));
                    } catch (e) {
                        console.error(`Error fetching options for ${field.name}`, e);
                    }
                }
            }
            setDynamicOptions(options);

            const deptId = localStorage.getItem('department_id');
            const userRole = localStorage.getItem('user_role');

            setFormData((prev: any) => {
                const updated = { ...prev, organizationId: orgId };
                if (deptId && userRole !== 'SuperAdmin' && userRole !== 'OrganizationAdmin') {
                    updated.departmentId = deptId;
                }
                return updated;
            });

            if (deptId && userRole !== 'SuperAdmin' && userRole !== 'OrganizationAdmin') {
                try {
                    const res = await fetch(`/api/resource/department/${deptId}`);
                    const json = await res.json();
                    if (json.data?.name) {
                        setFormData((prev: any) => ({ ...prev, department: json.data.name }));
                    }
                } catch (e) {
                    console.error('Error pre-populating department', e);
                }
            }
        };

        fetchDynamicOptions();
    }, [doctype, fields]);

    const handleSave = async () => {
        // Validation
        const requiredFields = fields.filter(f => f.required);
        for (const field of requiredFields) {
            if (!formData[field.name]) {
                alert(`Please fill in the required field: ${field.label}`);
                return;
            }
        }

        if (!formData.organizationId) {
            alert('Organization ID is missing. Please try logging in again.');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/resource/${doctype}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                navigate(`/${doctype}`);
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || 'Failed to save record'}`);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to connect to server');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in text-[#1d2129]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#d1d8dd]">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <ChevronLeft size={20} className="text-gray-500" />
                    </button>
                    <div>
                        <p className="text-[11px] text-[#8d99a6] uppercase font-bold tracking-wider">New {displayTitle}</p>
                        <h2 className="text-[20px] font-bold">Untitled</h2>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate(-1)} className="bg-white border border-[#d1d8dd] px-4 py-1.5 rounded text-[13px] font-semibold hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 text-white px-6 py-1.5 rounded text-[13px] font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        <Save size={14} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <div className="p-8 bg-white space-y-8 border border-[#d1d8dd] rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {fields.map((field, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <label className="text-[12px] font-medium text-[#626161]">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>

                            {field.type === 'select' ? (
                                <select
                                    className="w-full bg-[#f0f4f7] border border-[#d1d8dd] rounded px-3 py-1.5 text-[13px] focus:bg-white focus:border-blue-400 outline-none transition-all"
                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                >
                                    <option value="">Select...</option>
                                    {field.options && field.options.map((opt: string) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                    {(dynamicOptions[field.name] || []).map((opt: any) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : field.type === 'date' ? (
                                <input
                                    type="date"
                                    className="w-full bg-[#f0f4f7] border border-[#d1d8dd] rounded px-3 py-1.5 text-[13px] focus:bg-white focus:border-blue-400 outline-none transition-all"
                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                />
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    className="w-full bg-[#f0f4f7] border border-[#d1d8dd] rounded px-3 py-1.5 text-[13px] focus:bg-white focus:border-blue-400 outline-none transition-all min-h-[100px]"
                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                />
                            ) : field.type === 'checkbox' ? (
                                <div className="flex items-center h-[34px]">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                                    />
                                </div>
                            ) : (
                                <input
                                    type={field.type}
                                    placeholder={field.placeholder || ''}
                                    className="w-full bg-[#f0f4f7] border border-[#d1d8dd] rounded px-3 py-1.5 text-[13px] focus:bg-white focus:border-blue-400 outline-none transition-all"
                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="pt-8 border-t border-gray-100">
                    <p className="text-[11px] text-[#8d99a6] italic">Note: Fields marked with * are mandatory.</p>
                </div>
            </div>
        </div>
    );
}
