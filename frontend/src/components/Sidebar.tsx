import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Heart, TrendingUp, X } from 'lucide-react'

import { navItems } from '@/components/sidebarNav'

const buildDate = __APP_BUILD_DATE__
const buildCommit = __APP_BUILD_COMMIT__
const buildVersion = __APP_BUILD_VERSION__

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showSponsor, setShowSponsor] = useState(false)

    return (
        <>
        <aside
            className={`fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-md border-r border-slate-700 flex flex-col z-50 transition-all duration-300 ${isExpanded ? 'w-48' : 'w-16'
                }`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-slate-700 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    {isExpanded && (
                        <span className="font-bold text-base bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
                            TradingAgents
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {isExpanded && (
                            <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Sponsor */}
            <div className="px-2 pb-2">
                <button
                    onClick={() => setShowSponsor(true)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-pink-400 hover:bg-pink-500/10 hover:text-pink-300"
                    title="赞助支持"
                >
                    <Heart className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && (
                        <span className="font-medium text-sm whitespace-nowrap">赞助支持</span>
                    )}
                </button>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-700">
                {isExpanded ? (
                    <div className="text-xs text-slate-500 text-center">
                        <p className="text-slate-400 text-sm font-medium">TradingAgents</p>
                        <p className="mt-0.5">多智能体投研系统</p>
                        <p className="mt-1 font-mono text-[11px] text-slate-400">{buildVersion}</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">{buildDate} · {buildCommit}</p>
                    </div>
                ) : (
                    <div className="text-[10px] text-slate-500 text-center font-mono">{buildCommit}</div>
                )}
            </div>
        </aside>

        {/* Sponsor Modal */}
        {showSponsor && (
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowSponsor(false)}
            >
                <div
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 mx-4 max-w-sm w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">赞助支持</h3>
                        </div>
                        <button
                            onClick={() => setShowSponsor(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
                        赞助用于站点运营，感谢您的支持
                    </p>
                    <div className="flex justify-center">
                        <img
                            src="/wxpay.png"
                            alt="微信收款码"
                            className="w-52 h-52 object-contain rounded-xl border border-slate-100 dark:border-slate-700"
                        />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center mt-4">
                        微信支付 · 金额随意
                    </p>
                </div>
            </div>
        )}
        </>
    )
}
