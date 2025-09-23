import React, { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { useNavigate } from 'react-router-dom'


const LandingPage = () => {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);

    // Apply or remove 'dark' class on <html>
    useEffect(() => {
        const userinfo = localStorage.getItem('UserInfo')
        // console.log(userinfo, "fdgdaga")
        if (userinfo?.user?.id) {
            navigate('/chat')
        }
    }, [])

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const Notify = () => {

        const text = `HEY! Your tasks is now overdue.`;
        const notification = new Notification("To do list", { body: text });
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/40 shadow-sm">
                <div className="flex items-center justify-between px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">InstantTalks</h1>
                    <div className="space-x-3">

                        <Button
                            onClick={() => navigate("/login")}
                            className="rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                        >
                            Login
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-8 py-12 text-center mt-60">
                <div className="max-w-3xl space-y-6">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                        INSTANT <span className="text-gray-700">INSANE</span> TALKS
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-gray-600 italic">
                        Seamless global messaging — stay connected wherever you are.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button size="lg" className="rounded-xl bg-gray-900 text-white hover:bg-gray-800" onClick={() => navigate("/login")}>
                            Get Started
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-xl">
                            Learn More
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default LandingPage