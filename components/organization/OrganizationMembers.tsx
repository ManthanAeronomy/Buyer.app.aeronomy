'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, Shield, Eye, ShoppingCart, DollarSign, FileCheck, Trash2, Edit2, X } from 'lucide-react'

interface Member {
  _id: string
  userId: string
  role: 'admin' | 'compliance' | 'buyer' | 'finance' | 'viewer'
  email: string
  firstName?: string
  lastName?: string
  username?: string
  createdAt: string
}

const roleIcons = {
  admin: Shield,
  compliance: FileCheck,
  buyer: ShoppingCart,
  finance: DollarSign,
  viewer: Eye,
}

const roleColors = {
  admin: 'bg-purple-100 text-purple-700',
  compliance: 'bg-blue-100 text-blue-700',
  buyer: 'bg-green-100 text-green-700',
  finance: 'bg-yellow-100 text-yellow-700',
  viewer: 'bg-gray-100 text-gray-700',
}

export default function OrganizationMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [newMemberUserId, setNewMemberUserId] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'compliance' | 'buyer' | 'finance' | 'viewer'>('viewer')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/organizations/members')
      const data = await response.json()
      if (response.ok) {
        setMembers(data.members || [])
      } else {
        setError(data.error || 'Failed to fetch members')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch members')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!newMemberUserId.trim()) {
      setError('User ID is required')
      return
    }

    try {
      const response = await fetch('/api/organizations/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkUserId: newMemberUserId.trim(),
          role: newMemberRole,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setShowAddForm(false)
        setNewMemberUserId('')
        setNewMemberRole('viewer')
        setError(null)
        fetchMembers()
      } else {
        setError(data.error || 'Failed to add member')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add member')
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/organizations/members/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json()
      if (response.ok) {
        setEditingMember(null)
        setError(null)
        fetchMembers()
      } else {
        setError(data.error || 'Failed to update role')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update role')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return
    }

    try {
      const response = await fetch(`/api/organizations/members/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (response.ok) {
        setError(null)
        fetchMembers()
      } else {
        setError(data.error || 'Failed to remove member')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove member')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-500">Loading members...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">Organization Members</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {members.length}
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <UserPlus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Add New Member</h3>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewMemberUserId('')
                setError(null)
              }}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Clerk User ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newMemberUserId}
                onChange={(e) => setNewMemberUserId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="user_xxxxxxxxxxxxx"
              />
              <p className="mt-1 text-xs text-slate-500">
                Enter the Clerk user ID of the user you want to add
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="viewer">Viewer</option>
                <option value="buyer">Buyer</option>
                <option value="finance">Finance</option>
                <option value="compliance">Compliance</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddMember}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Add Member
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewMemberUserId('')
                  setError(null)
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-sm font-medium text-slate-600">No members found</p>
          <p className="mt-1 text-xs text-slate-500">Add your first member to get started</p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {members.map((member) => {
                const RoleIcon = roleIcons[member.role]
                const isEditing = editingMember?._id === member._id

                return (
                  <tr key={member._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {member.firstName || member.lastName
                            ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
                            : member.username || member.email || 'User'}
                        </div>
                        {member.email && member.email !== 'No email' && (
                          <div className="text-sm text-slate-500">{member.email}</div>
                        )}
                        <div className="text-xs text-slate-400 mt-1">ID: {member.userId.slice(0, 12)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={editingMember.role}
                          onChange={(e) => {
                            setEditingMember({ ...editingMember, role: e.target.value as any })
                          }}
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          onBlur={() => {
                            if (editingMember.role !== member.role) {
                              handleUpdateRole(member.userId, editingMember.role)
                            } else {
                              setEditingMember(null)
                            }
                          }}
                          autoFocus
                        >
                          <option value="viewer">Viewer</option>
                          <option value="buyer">Buyer</option>
                          <option value="finance">Finance</option>
                          <option value="compliance">Compliance</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${roleColors[member.role]}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {!isEditing ? (
                          <>
                            <button
                              onClick={() => setEditingMember(member)}
                              className="text-primary-600 hover:text-primary-700"
                              title="Edit role"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.userId)}
                              className="text-red-600 hover:text-red-700"
                              title="Remove member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditingMember(null)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}














