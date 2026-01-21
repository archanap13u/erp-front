import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Building2, Key, Eye, EyeOff, Calendar, CreditCard } from 'lucide-react';

export default function EditOrganizationPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        username: '',
        password: '',
        isActive: true,
        plan: 'free' as 'free' | 'basic' | 'premium' | 'enterprise',
        subscriptionStatus: 'active' as 'active' | 'expired' | 'suspended' | 'trial',
        expiryDate: '',
        maxUsers: 0
    });

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'SuperAdmin') {
            navigate('/login');
            return;
        }
        if (id) fetchOrganization();
    }, [navigate, id]);

    const fetchOrganization = async () => {
        try {
            const response = await fetch(`/api/superadmin/organizations/${id}`);
            const data = await response.json();
            if (data.success) {
                const org = data.data;
                setFormData({
                    name: org.name,
                    domain: org.domain || '',
                    username: org.username || '',
                    password: org.password || '',
                    isActive: org.isActive,
                    plan: org.subscription?.plan || 'free',
                    subscriptionStatus: org.subscription?.status || 'active',
                    expiryDate: org.subscription?.expiryDate ? new Date(org.subscription.expiryDate).toISOString().split('T')[0] : '',
                    maxUsers: org.subscription?.maxUsers || 0
                });
            } else {
                alert('Organization not found');
                navigate('/superadmin/organizations');
            }
        } catch (error) {
            console.error('Error fetching organization:', error);
            alert('Failed to load organization');
        } finally {
            setLoading(false);
        }
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
        setFormData({ ...formData, password });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const response = await fetch(`/api/superadmin/organizations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    subscription: {
                        plan: formData.plan,
                        status: formData.subscriptionStatus,
                        expiryDate: formData.expiryDate || null,
                        maxUsers: formData.maxUsers
                    }
                })
            });
            const data = await response.json();
            if (data.success) {
                alert('Organization updated successfully!');
                navigate(`/superadmin/organizations/${id}`);
            } else setError(data.error || 'Failed to update organization');
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;

    return (
        <div className="p-8 text-[#1d2129]">
            <div className="mb-8">
                <Link to={`/superadmin/organizations/${id}`} className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Organization Details
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Organization</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
                            General Details
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name *</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Username *</label>
                                <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                                <div className="flex items-center space-x-2">
                                    <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg outline-none" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                                    <button type="button" onClick={generatePassword} className="px-4 py-3 bg-gray-100 rounded-lg text-sm font-medium">Generate</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                            Subscription Details
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Plan</label>
                                <select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none">
                                    <option value="free">Free</option>
                                    <option value="basic">Basic</option>
                                    <option value="premium">Premium</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                            {/* TEMPORARILY DISABLED: Max Users field
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Users</label>
                                <input type="number" value={formData.maxUsers} onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" />
                            </div>
                            */}
                        </div>
                    </div>
                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <Link to={`/superadmin/organizations/${id}`} className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</Link>
                        <button type="submit" disabled={saving} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50">
                            <Save className="w-5 h-5 inline mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
            {error && <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
        </div>
    );
}
