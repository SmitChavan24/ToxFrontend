import React, { useState } from 'react'
import { Search, Zap, X, ChevronDown, ChevronUp } from 'lucide-react'

const defaultResponses = [
    { id: 1, title: "Greeting", text: "Hello! Thank you for reaching out. How can I help you today?", category: "General" },
    { id: 2, title: "Hold On", text: "I appreciate your patience. Let me look into this for you right away.", category: "General" },
    { id: 3, title: "Escalation", text: "I'm going to escalate this to our specialized team so we can get this resolved for you quickly.", category: "General" },
    { id: 4, title: "Follow-Up", text: "Just following up — is there anything else I can help you with?", category: "General" },
    { id: 5, title: "Resolved", text: "I'm glad we could resolve this for you! If you need anything in the future, don't hesitate to reach out.", category: "Closing" },
    { id: 6, title: "Password Reset", text: "I can help you reset your password. Please check your email for a reset link — it should arrive within the next few minutes.", category: "Technical" },
    { id: 7, title: "Bug Report Ack", text: "Thank you for reporting this issue. I've logged it with our engineering team and we'll keep you updated on the fix.", category: "Technical" },
    { id: 8, title: "Refund Info", text: "I understand your concern. Let me process this for you. Refunds typically take 5-7 business days to appear.", category: "Billing" },
]

const CannedResponses = ({ onSelect, onClose }) => {
    const [search, setSearch] = useState('')
    const [expanded, setExpanded] = useState(true)

    const filtered = defaultResponses.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.text.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase())
    )

    const grouped = filtered.reduce((acc, r) => {
        if (!acc[r.category]) acc[r.category] = []
        acc[r.category].push(r)
        return acc
    }, {})

    return (
        <div className="bg-white border-t border-gray-200 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-bold text-gray-700">Quick Replies</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setExpanded(!expanded)} className="p-1 rounded hover:bg-gray-100">
                        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronUp className="h-3.5 w-3.5 text-gray-400" />}
                    </button>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
                        <X className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                </div>
            </div>

            {expanded && (
                <>
                    {/* Search */}
                    <div className="px-4 py-2">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                            <Search className="h-3.5 w-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search replies..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none"
                            />
                        </div>
                    </div>

                    {/* Responses */}
                    <div className="max-h-52 overflow-y-auto px-3 pb-3">
                        {Object.entries(grouped).map(([category, responses]) => (
                            <div key={category} className="mb-2">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1">{category}</p>
                                <div className="space-y-1">
                                    {responses.map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => onSelect(r.text)}
                                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 active:bg-indigo-100 transition group"
                                        >
                                            <p className="text-xs font-semibold text-gray-700 group-hover:text-indigo-700">{r.title}</p>
                                            <p className="text-[11px] text-gray-400 truncate mt-0.5">{r.text}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-4">No matching replies found</p>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default CannedResponses
