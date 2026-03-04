import React from 'react'
import { Inbox, Clock, CheckCircle2, AlertCircle, Filter } from 'lucide-react'

const tabs = [
    { key: 'all', label: 'All', icon: <Inbox className="h-3.5 w-3.5" /> },
    { key: 'open', label: 'Open', icon: <AlertCircle className="h-3.5 w-3.5" /> },
    { key: 'pending', label: 'Pending', icon: <Clock className="h-3.5 w-3.5" /> },
    { key: 'resolved', label: 'Resolved', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
]

const ConversationFilters = ({ activeFilter, onFilterChange, counts = {} }) => {
    return (
        <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
                const isActive = activeFilter === tab.key
                const count = counts[tab.key] || 0
                return (
                    <button
                        key={tab.key}
                        onClick={() => onFilterChange(tab.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                            isActive
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {count > 0 && (
                            <span className={`ml-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                                {count > 99 ? '99+' : count}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

export default ConversationFilters
