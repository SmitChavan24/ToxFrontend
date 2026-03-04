import React from 'react'
import { User, Mail, Clock, Tag, MessageSquare, Hash } from 'lucide-react'

const CustomerInfoPanel = ({ customer, conversationMeta, onClose }) => {
    if (!customer) return null

    const getInitials = (name) => {
        if (!name) return '?'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const priorityConfig = {
        high: { label: 'High', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
        medium: { label: 'Medium', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
        low: { label: 'Low', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    }

    const statusConfig = {
        open: { label: 'Open', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
        resolved: { label: 'Resolved', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    }

    const priority = priorityConfig[conversationMeta?.priority] || priorityConfig.medium
    const status = statusConfig[conversationMeta?.status] || statusConfig.open

    return (
        <div className="h-full bg-white border-l border-gray-200 flex flex-col w-72 lg:w-80 shrink-0">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">Customer Info</h3>
                <button
                    onClick={onClose}
                    className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                    ✕
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Profile Section */}
                <div className="px-5 py-5 border-b border-gray-50">
                    <div className="flex flex-col items-center text-center">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                            {getInitials(customer.name)}
                        </div>
                        <h4 className="mt-3 text-sm font-bold text-gray-900">{customer.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{customer.email || 'No email'}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className={`h-2 w-2 rounded-full ${customer.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-xs text-gray-500">{customer.status === 'online' ? 'Online now' : 'Offline'}</span>
                        </div>
                    </div>
                </div>

                {/* Conversation Details */}
                <div className="px-5 py-4 border-b border-gray-50">
                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Conversation</h5>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                <Tag className="h-3.5 w-3.5" /> Priority
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priority.color}`}>
                                {priority.label}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                <Hash className="h-3.5 w-3.5" /> Status
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status.color}`}>
                                {status.label}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5" /> Messages
                            </span>
                            <span className="text-xs font-medium text-gray-700">
                                {conversationMeta?.messageCount || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" /> Created
                            </span>
                            <span className="text-xs text-gray-600">
                                {conversationMeta?.createdAt || 'Just now'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="px-5 py-4 border-b border-gray-50">
                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tags</h5>
                    <div className="flex flex-wrap gap-1.5">
                        {(conversationMeta?.tags || ['support', 'general']).map((tag, i) => (
                            <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="px-5 py-4">
                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h5>
                    <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" /> Send email
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition flex items-center gap-2">
                            <User className="h-3.5 w-3.5" /> View full profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomerInfoPanel
