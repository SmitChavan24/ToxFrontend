import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import {
    MessageSquare,
    Zap,
    Bot,
    Users,
    BarChart3,
    Shield,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Headphones,
} from 'lucide-react'

const features = [
    {
        icon: <MessageSquare className="h-6 w-6" />,
        title: "Real-Time Chat",
        desc: "Instantly connect with customers through blazing-fast WebSocket messaging.",
    },
    {
        icon: <Bot className="h-6 w-6" />,
        title: "AI Smart Replies",
        desc: "Get AI-powered reply suggestions and auto-responses to handle queries faster.",
    },
    {
        icon: <Zap className="h-6 w-6" />,
        title: "Message Enhancement",
        desc: "Polish your replies with AI — make them professional, friendly, or casual in one click.",
    },
    {
        icon: <Users className="h-6 w-6" />,
        title: "Team Collaboration",
        desc: "Assign, transfer, and manage conversations across your entire support team.",
    },
    {
        icon: <BarChart3 className="h-6 w-6" />,
        title: "Live Dashboard",
        desc: "Track open tickets, response times, and customer satisfaction in real time.",
    },
    {
        icon: <Shield className="h-6 w-6" />,
        title: "Secure & Reliable",
        desc: "Enterprise-grade security with encrypted messaging and 99.9% uptime.",
    },
]

const steps = [
    { num: "01", title: "Create Your Account", desc: "Sign up your organization in seconds." },
    { num: "02", title: "Set Up Your Team", desc: "Invite agents and configure your workflows." },
    { num: "03", title: "Start Supporting", desc: "Go live and delight your customers instantly." },
]

const LandingPage = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const userinfo = sessionStorage.getItem('UserInfo')
        if (userinfo) {
            try {
                const parsed = JSON.parse(userinfo)
                if (parsed?.user?.id) navigate('/dashboard')
            } catch {}
        }
    }, [])

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Headphones className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">HelpWave</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/login")}
                            className="text-gray-300 hover:text-white hover:bg-white/5 rounded-xl"
                        >
                            Sign In
                        </Button>
                        <Button
                            onClick={() => navigate("/register")}
                            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25 border-0"
                        >
                            Get Started Free
                        </Button>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative pt-20 pb-32 px-6">
                {/* Glow effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-600/20 via-violet-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8 backdrop-blur-sm">
                        <Sparkles className="h-4 w-4 text-indigo-400" />
                        AI-Powered Customer Support
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight">
                        Delight customers with{' '}
                        <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                            instant, intelligent
                        </span>{' '}
                        support
                    </h1>

                    <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        The modern support platform that combines real-time chat, AI-powered replies, and
                        smart workflows to help your team resolve issues 3x faster.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                        <Button
                            size="lg"
                            onClick={() => navigate("/register")}
                            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25 border-0 px-8 py-6 text-base font-semibold"
                        >
                            Start Free Trial
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => navigate("/login")}
                            className="rounded-xl border-white/10 text-gray-300 hover:bg-white/5 hover:text-white px-8 py-6 text-base"
                        >
                            Sign In to Dashboard
                        </Button>
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Free 14-day trial</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> No credit card</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Cancel anytime</span>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="relative py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Everything you need to{' '}
                            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                                support at scale
                            </span>
                        </h2>
                        <p className="mt-4 text-gray-400 max-w-xl mx-auto">
                            Powerful tools that help your team deliver exceptional customer experiences.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all duration-300"
                            >
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it Works ── */}
            <section className="relative py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Get started in{' '}
                            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                                3 simple steps
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {steps.map((s, i) => (
                            <div key={i} className="relative text-center">
                                <div className="text-5xl font-black text-white/5 mb-3">{s.num}</div>
                                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                                <p className="text-sm text-gray-400">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="relative py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="p-10 rounded-3xl bg-gradient-to-br from-indigo-600/10 via-violet-600/10 to-purple-600/10 border border-indigo-500/20">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Ready to transform your support?
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                            Join teams who deliver faster, smarter customer support with HelpWave.
                        </p>
                        <Button
                            size="lg"
                            onClick={() => navigate("/register")}
                            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25 border-0 px-8 py-6 text-base font-semibold"
                        >
                            Start Your Free Trial
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-white/5 py-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                            <Headphones className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-400">HelpWave</span>
                    </div>
                    <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} HelpWave. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage