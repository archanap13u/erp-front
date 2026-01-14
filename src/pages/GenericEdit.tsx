import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Trash2, ArrowLeft } from 'lucide-react';
import { fieldRegistry } from '../config/fields';

export default function GenericEdit() {
    const { doctype, id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dynamicOptions, setDynamicOptions] = useState<{ [key: string]: { label: string, value: string }[] }>({});

    const fields = fieldRegistry[doctype as string] || [{ name: 'name', label: 'Name', type: 'text' }];
    const displayTitle = (doctype as string || '').replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

    useEffect(() => {
        if (!doctype || !id) return;
        setLoading(true);
        const orgId = localStorage.getItem('organization_id');

        const fetchDynamicOptions = async () => {
            const options: { [key: string]: { label: string, value: string }[] } = {};
            for (const field of fields) {
                if (field.link && orgId) {
                    try {
                        const res = await fetch(`/api/resource/${field.link}?organizationId=${orgId}`);
                        const json = await res.json();
                        options[field.name] = (json.data || []).map((item: any) => ({
                            label: item.job_title || item.title || item.name || item.employeeName || item.studentName || item._id,
                            value: item._id || item.name // Ensure we use ID if available for reliable linking
                        }));
                    } catch (e) {
                        console.error(`Error fetching options for ${field.name}`, e);
                    }
                }
            }
            setDynamicOptions(options);
        };

        fetchDynamicOptions();

        fetch(`/api/resource/${doctype}/${id}`)
            .then(res => res.json())
            .then(json => {
                setFormData(json.data || {});
                setLoading(false);
            })
            .catch(err => {
                console.error('Fetch error:', err);
                setLoading(false);
            });
    }, [doctype, id, fields]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/resource/${doctype}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                navigate(`/${doctype}`);
            } else {
                const err = await res.json();
                alert(`Error: ${err.error}`);
            }
        } catch (e) {
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`/api/resource/${doctype}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                navigate(`/${doctype}`);
            }
        } catch (e) {
            alert('Failed to delete');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 italic">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto animate-in text-[#1d2129]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#d1d8dd]">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <ArrowLeft size={20} className="text-gray-500" />
                    </button>
                    <div>
                        <p className="text-[11px] text-[#8d99a6] uppercase font-bold tracking-wider">{displayTitle}</p>
                        <h2 className="text-[20px] font-bold">
                            {formData.universityName || formData.centerName || formData.programName || formData.employeeName || formData.studentName || formData.student || id}
                        </h2>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleDelete} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors mr-2">
                        <Trash2 size={18} />
                    </button>
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

            <div className="p-8 bg-white border border-[#d1d8dd] rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {fields.map((field, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <label className="text-[12px] font-semibold text-gray-600">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>

                            {field.type === 'select' ? (
                                <select
                                    className="w-full bg-[#f0f4f7] border border-[#d1d8dd] rounded px-3 py-2 text-[13px] focus:bg-white focus:border-blue-400 outline-none transition-all"
                                    value={formData[field.name] || ''}
                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                >
                                    <option value="">Select...</option>
                                    {(field.options || []).map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                    {(dynamicOptions[field.name] || []).map((opt: any) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : field.type === 'date' ? (
                                <input
                                    type="date"
                                    className="w-full bg-[#f0f4f7] border border-[#d1d8dd] rounded px-3 py-2 text-[13px] focus:bg-white focus:border-blue-400 outline-none transition-all"
                                    value={formData[field.name]?.split('T')[0] || ''}
                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                />
                            ) : (
                                <input
                                    type={field.type}
                                    placeholder={field.placeholder || ''}
                                    className="w-full bg-[#f0f4f7] border border-[#d1d8dd] rounded px-3 py-2 text-[13px] focus:bg-white focus:border-blue-400 outline-none transition-all"
                                    value={formData[field.name] || ''}
                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
