import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowLeft, Save, Eye, EyeOff, Key } from 'lucide-react';

export default function NewOrganizationPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        username: '',
        password: '',
        plan: 'free' as 'free' | 'basic' | 'premium' | 'enterprise',
        maxUsers: 10
    });

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
        setFormData({ ...formData, password });
    };

    const handleSubmit = async (e: React.FormEvent, autoLogin = false) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const createdBy = localStorage.getItem('user_id');
            if (!createdBy) {
                setError('User not authenticated');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/superadmin/organizations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    createdBy,
                    subscription: {
                        plan: formData.plan,
                        maxUsers: formData.maxUsers,
                        startDate: new Date()
                    }
                })
            });

            const data = await response.json();
            if (data.success) {
                if (autoLogin) {
                    // Perform automatic login
                    const loginRes = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: formData.username, password: formData.password }),
                    });
                    const loginData = await loginRes.json();
                    if (loginData.success) {
                        localStorage.setItem('user_role', loginData.user.role);
                        localStorage.setItem('user_name', loginData.user.name);
                        if (loginData.user.organizationId) localStorage.setItem('organization_id', loginData.user.organizationId);
                        navigate('/organization-dashboard');
                    } else {
                        alert('Organization created successfully, but auto-login failed. Please login manually.');
                        navigate('/superadmin/organizations');
                    }
                } else {
                    alert('Organization created successfully!');
                    navigate('/superadmin/organizations');
                }
            } else setError(data.error || 'Failed to create organization');
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 text-[#1d2129]">
            <div className="mb-8">
                <Link to="/superadmin/organizations" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Organizations
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Organization</h1>
                <p className="text-gray-600">Set up a new organization in your platform</p>
            </div>

            <div className="max-w-2xl">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name *</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" placeholder="e.g., Acme Corporation" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Username *</label>
                            <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" placeholder="e.g., acme_admin" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                            <div className="flex items-center space-x-2">
                                <div className="relative flex-1">
                                    <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg outline-none" placeholder="Enter password" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <button type="button" onClick={generatePassword} className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Generate</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <Link to="/superadmin/organizations" className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</Link>
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e as any, true)}
                                disabled={loading}
                                className="flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-200 transition disabled:opacity-50"
                            >
                                <Key size={20} />
                                <span>{loading ? 'Processing...' : 'Create & Login'}</span>
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
                            >
                                <Save size={20} />
                                <span>{loading ? 'Creating...' : 'Create Organization'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
