'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import {
    ArrowLeft,
    User,
    Mail,
    Bell,
    Building2,
    Phone,
    Save,
    Loader2,
    Check
} from 'lucide-react'

interface EmailPreferences {
    marketingEmails: boolean
    bidNotifications: boolean
    contractUpdates: boolean
    securityAlerts: boolean
}

interface OrganizationData {
    name: string
    userName: string
    companyEmail: string
    headquarters: string
    organizationType: string
    emailPreferences: EmailPreferences
}

export default function SettingsPage() {
    const router = useRouter()
    const { user } = useUser()
    const [activeTab, setActiveTab] = useState<'account' | 'contact' | 'notifications'>('account')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const [orgData, setOrgData] = useState<OrganizationData>({
        name: '',
        userName: '',
        companyEmail: '',
        headquarters: '',
        organizationType: '',
        emailPreferences: {
            marketingEmails: true,
            bidNotifications: true,
            contractUpdates: true,
            securityAlerts: true,
        }
    })

    useEffect(() => {
        fetchOrganizationData()
    }, [])

    const fetchOrganizationData = async () => {
        try {
            const res = await fetch('/api/organization/profile')
            if (res.ok) {
                const data = await res.json()
                setOrgData({
                    name: data.name || '',
                    userName: data.userName || '',
                    companyEmail: data.companyEmail || '',
                    headquarters: data.headquarters || '',
                    organizationType: data.organizationType || '',
                    emailPreferences: data.emailPreferences || {
                        marketingEmails: true,
                        bidNotifications: true,
                        contractUpdates: true,
                        securityAlerts: true,
                    }
                })
            }
        } catch (error) {
            console.error('Failed to fetch organization data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setSaved(false)

        try {
            const res = await fetch('/api/organization/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: orgData.name,
                    userName: orgData.userName,
                    companyEmail: orgData.companyEmail,
                    headquarters: orgData.headquarters,
                    emailPreferences: orgData.emailPreferences,
                }),
            })

            if (res.ok) {
                setSaved(true)
                setTimeout(() => setSaved(false), 3000)
            } else {
                throw new Error('Failed to save')
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            alert('Failed to save settings. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const tabs = [
        { id: 'account', label: 'Account', icon: User },
        { id: 'contact', label: 'Contact', icon: Mail },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ]

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-4xl px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
                            <p className="text-sm text-slate-500">Manage your account and preferences</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-4xl px-6 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Tabs */}
                    <div className="w-48 shrink-0">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                            {/* Account Tab */}
                            {activeTab === 'account' && (
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-6">Account Information</h2>

                                    <div className="space-y-6">
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Your Name</label>
                                                <input
                                                    type="text"
                                                    value={orgData.userName}
                                                    onChange={(e) => setOrgData({ ...orgData, userName: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Your full name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Company Name</label>
                                                <input
                                                    type="text"
                                                    value={orgData.name}
                                                    onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Company name"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Organization Type</label>
                                                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                                    <Building2 className="h-4 w-4" />
                                                    {orgData.organizationType === 'airline' ? 'Airline / Buyer' :
                                                        orgData.organizationType === 'producer' ? 'SAF Producer' :
                                                            orgData.organizationType === 'trader' ? 'Fuel Trader / Distributor' :
                                                                orgData.organizationType || 'Not set'}
                                                </div>
                                                <p className="text-xs text-slate-500">Contact support to change organization type</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Headquarters</label>
                                                <select
                                                    value={orgData.headquarters}
                                                    onChange={(e) => setOrgData({ ...orgData, headquarters: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select location</option>
                                                    <option value="US">United States</option>
                                                    <option value="EU">European Union</option>
                                                    <option value="UK">United Kingdom</option>
                                                    <option value="APAC">Asia Pacific</option>
                                                    <option value="MENA">Middle East & North Africa</option>
                                                    <option value="LATAM">Latin America</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Contact Tab */}
                            {activeTab === 'contact' && (
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-6">Contact Details</h2>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Primary Email (Clerk Account)</label>
                                            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                                <Mail className="h-4 w-4" />
                                                {user?.primaryEmailAddress?.emailAddress || 'No email'}
                                            </div>
                                            <p className="text-xs text-slate-500">This is your login email managed by Clerk</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Company Email</label>
                                            <input
                                                type="email"
                                                value={orgData.companyEmail}
                                                onChange={(e) => setOrgData({ ...orgData, companyEmail: e.target.value })}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="company@example.com"
                                            />
                                            <p className="text-xs text-slate-500">Used for business communications and notifications</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                                <Phone className="h-4 w-4" />
                                                {user?.primaryPhoneNumber?.phoneNumber || 'Not provided'}
                                            </div>
                                            <p className="text-xs text-slate-500">Managed through your Clerk account</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-2">Email Notifications</h2>
                                    <p className="text-sm text-slate-500 mb-6">Choose which emails you&apos;d like to receive</p>

                                    <div className="space-y-4">
                                        {[
                                            {
                                                key: 'bidNotifications',
                                                title: 'Bid Notifications',
                                                description: 'Get notified when you receive new bids or bid updates'
                                            },
                                            {
                                                key: 'contractUpdates',
                                                title: 'Contract Updates',
                                                description: 'Receive updates about contract status changes'
                                            },
                                            {
                                                key: 'marketingEmails',
                                                title: 'Marketing & News',
                                                description: 'Product updates, SAF industry news, and tips'
                                            },
                                            {
                                                key: 'securityAlerts',
                                                title: 'Security Alerts',
                                                description: 'Important security notifications about your account'
                                            },
                                        ].map((pref) => (
                                            <div
                                                key={pref.key}
                                                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                                            >
                                                <div>
                                                    <p className="font-medium text-slate-900">{pref.title}</p>
                                                    <p className="text-sm text-slate-500">{pref.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => setOrgData({
                                                        ...orgData,
                                                        emailPreferences: {
                                                            ...orgData.emailPreferences,
                                                            [pref.key]: !orgData.emailPreferences[pref.key as keyof EmailPreferences]
                                                        }
                                                    })}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${orgData.emailPreferences[pref.key as keyof EmailPreferences]
                                                        ? 'bg-blue-600'
                                                        : 'bg-slate-200'
                                                        }`}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${orgData.emailPreferences[pref.key as keyof EmailPreferences]
                                                            ? 'translate-x-5'
                                                            : 'translate-x-0'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            <div className="border-t border-slate-200 px-6 py-4 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : saved ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Saved!
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
