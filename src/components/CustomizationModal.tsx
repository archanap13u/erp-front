import React, { useState, useEffect } from 'react';
import { X, Check, Layout, Shield, Settings, Info } from 'lucide-react';

interface CustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFeatures: string[];
    onSave: (features: string[]) => void;
    title?: string;
}

const ALL_FEATURES = [
    'Add Employee', 'Post Vacancy', 'Employee Transfer',
    'Attendance', 'Recruitment', 'Payroll', 'Employee Lifecycle', 'Shift Management', 'Holidays', 'Announcements',
    'Invoices', 'Payments', 'Expenses', 'General Ledger', 'Taxation', 'Quotations', 'Sales Orders',
    'University', 'Study Center', 'Applications', 'Student Records', 'Programs',
    'Stock Entry', 'Delivery Note', 'Item Management', 'Purchase Receipt', 'Warehouses', 'Suppliers',
    'Leads', 'Deals', 'Customers', 'Touchpoints',
    'Projects', 'Tasks', 'Timesheets', 'Agile Board',
    'Tickets', 'Issues', 'Warranty Claims', 'Knowledge Base',
    'Asset Tracking', 'Maintenance', 'Depreciation'
];

const PRESETS = [
    {
        name: 'Full HR Portal',
        features: ['Add Employee', 'Post Vacancy', 'Employee Transfer', 'Attendance', 'Recruitment', 'Payroll', 'Employee Lifecycle', 'Shift Management', 'Holidays', 'Announcements'],
        description: 'Complete suite for Human Resources management'
    },
    {
        name: 'Finance & Accounts',
        features: ['Invoices', 'Payments', 'Expenses', 'General Ledger', 'Taxation', 'Quotations', 'Sales Orders'],
        description: 'Financial management and commercial tools'
    },
    {
        name: 'Education Ops',
        features: ['University', 'Study Center', 'Applications', 'Student Records', 'Programs'],
        description: 'Academic and operational management focus'
    },
    {
        name: 'Inventory & Stock',
        features: ['Stock Entry', 'Delivery Note', 'Item Management', 'Purchase Receipt', 'Warehouses', 'Suppliers'],
        description: 'Supply chain and inventory tracking'
    },
    {
        name: 'CRM & Sales',
        features: ['Leads', 'Deals', 'Customers', 'Touchpoints', 'Quotations', 'Sales Orders'],
        description: 'Customer relationship and sales management'
    }
];

export default function CustomizationModal({ isOpen, onClose, currentFeatures, onSave, title }: CustomizationModalProps) {
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSelectedFeatures(currentFeatures || []);
        }
    }, [isOpen, currentFeatures]);

    if (!isOpen) return null;

    const toggleFeature = (feature: string) => {
        setSelectedFeatures(prev =>
            prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature]
        );
    };

    const applyPreset = (features: string[]) => {
        setSelectedFeatures(features);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-gray-100">
                {/* Header */}
                <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h2 className="text-[24px] font-black text-[#1d2129] tracking-tight">{title || 'Portal Customization'}</h2>
                            <p className="text-[13px] text-gray-500 font-medium">Select features and layouts for this portal</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 flex flex-col lg:flex-row gap-10">
                    {/* Left Side: Presets */}
                    <div className="lg:w-1/3 space-y-6">
                        <div>
                            <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Layout size={14} /> Basic Portals (Presets)
                            </h3>
                            <div className="space-y-3">
                                {PRESETS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => applyPreset(preset.features)}
                                        className="w-full text-left p-4 rounded-2xl border border-gray-100 hover:border-blue-400 hover:shadow-md transition-all group bg-gray-50/50"
                                    >
                                        <p className="font-bold text-[#1d2129] group-hover:text-blue-600 transition-colors uppercase tracking-tight">{preset.name}</p>
                                        <p className="text-[11px] text-gray-500 font-medium mt-1 leading-tight">{preset.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                            <h4 className="flex items-center gap-2 text-[13px] font-bold text-blue-800 mb-2">
                                <Info size={16} /> Pro Tip
                            </h4>
                            <p className="text-[12px] text-blue-600 leading-relaxed font-medium">
                                Enabling a feature will automatically add the relevant links to the portal's sidebar navigation.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Feature Selection */}
                    <div className="lg:w-2/3">
                        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Shield size={14} /> Individual Features
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {ALL_FEATURES.map((feature) => {
                                const isActive = selectedFeatures.includes(feature);
                                return (
                                    <button
                                        key={feature}
                                        type="button"
                                        onClick={() => toggleFeature(feature)}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isActive
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                                            : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                                            }`}
                                    >
                                        <span className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-[#1d2129]'}`}>{feature}</span>
                                        {isActive && <Check size={14} className="text-blue-100" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-8 py-3 rounded-2xl text-[14px] font-bold text-gray-500 hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(selectedFeatures)}
                        type="button"
                        className="bg-blue-600 text-white px-10 py-3 rounded-2xl text-[14px] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                    >
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}
