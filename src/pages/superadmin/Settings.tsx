import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings,
    Shield,
    Mail,
    Sliders,
    Save,
    AlertTriangle,
    CheckCircle,
    RefreshCw
} from 'lucide-react';

interface PlatformSettings {
    _id: string;
    platformName: string;
    defaultSubscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
    maintenanceMode: boolean;
    maintenanceMessage: string;
    security: {
        sessionTimeout: number;
        maxLoginAttempts: number;
        passwordMinLength: number;
        requireSpecialCharacters: boolean;
        requireNumbers: boolean;
    };
    email: {
        senderName: string;
        senderEmail: string;
        enableNotifications: boolean;
    };
    features: {
        allowSelfRegistration: boolean;
        requireEmailVerification: boolean;
        enableStudentPortal: boolean;
        enableEmployeePortal: boolean;
    };
    updatedAt: string;
}

export default function SettingsPage() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'email' | 'features'>('general');

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'SuperAdmin') {
            navigate('/login');
            return;
        }
        fetchSettings();
    }, [navigate]);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/superadmin/settings');
            const result = await response.json();
            if (result.success) setSettings(result.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        setMessage(null);
        try {
            const response = await fetch('/api/superadmin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            const result = await response.json();
            if (result.success) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
                setSettings(result.data);
            } else setMessage({ type: 'error', text: result.error || 'Failed to save settings' });
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while saving' });
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (path: string, value: any) => {
        if (!settings) return;
        const keys = path.split('.');
        const newSettings = { ...settings };
        let current: any = newSettings;
        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setSettings(newSettings);
    };

    const tabs = [
        { id: 'general' as const, label: 'General', icon: Sliders },
        { id: 'security' as const, label: 'Security', icon: Shield },
        { id: 'email' as const, label: 'Email', icon: Mail },
        { id: 'features' as const, label: 'Features', icon: Settings }
    ];

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;

    return (
        <div className="p-8 text-[#1d2129]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                    <p className="text-gray-600">Configure platform-wide settings</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center">
                    {saving ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="flex space-x-2 mb-6 border-b border-gray-200">
                {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-4 py-3 font-medium transition border-b-2 -mb-px ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                {activeTab === 'general' && settings && (
                    <div className="space-y-4">
                        <div><label className="block text-sm font-semibold mb-2">Platform Name</label><input type="text" value={settings.platformName} onChange={(e) => updateSetting('platformName', e.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>
                        <div><label className="block text-sm font-semibold mb-2">Plan</label><select value={settings.defaultSubscriptionPlan} onChange={(e) => updateSetting('defaultSubscriptionPlan', e.target.value)} className="w-full px-4 py-2 border rounded-lg"><option value="free">Free</option><option value="basic">Basic</option><option value="premium">Premium</option><option value="enterprise">Enterprise</option></select></div>
                    </div>
                )}
                {/* Add other tabs content here as needed, following the same pattern */}
                {activeTab === 'security' && settings && (
                    <div className="space-y-4">
                        <div><label className="block text-sm font-semibold mb-2">Session Timeout (min)</label><input type="number" value={settings.security.sessionTimeout} onChange={(e) => updateSetting('security.sessionTimeout', parseInt(e.target.value))} className="w-full px-4 py-2 border rounded-lg" /></div>
                    </div>
                )}
                {activeTab === 'email' && settings && (
                    <div className="space-y-4">
                        <div><label className="block text-sm font-semibold mb-2">Sender Name</label><input type="text" value={settings.email.senderName} onChange={(e) => updateSetting('email.senderName', e.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>
                    </div>
                )}
                {activeTab === 'features' && settings && (
                    <div className="space-y-4">
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={settings.features.allowSelfRegistration} onChange={(e) => updateSetting('features.allowSelfRegistration', e.target.checked)} /> <span>Allow Self Registration</span></label>
                    </div>
                )}
            </div>
        </div>
    );
}
