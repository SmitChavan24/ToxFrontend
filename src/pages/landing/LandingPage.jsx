import React, { useEffect, useState } from 'react'
import Chat from '../../assets/images/map.jpg'
import Mapp from '../../assets/images/chat.jpg'
import Logo from '../../assets/images/ToXLogo.png'
import { useNavigate } from 'react-router-dom'


const LandingPage = () => {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);

    // Apply or remove 'dark' class on <html>
    useEffect(() => {
        const userinfo = localStorage.getItem('UserInfo')
        if (userinfo) {
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
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
            {/* Navbar */}
            <nav className="flex items-center hover:shadow-black">
                <img
                    src={Logo}
                    alt="Map preview"
                    className="w-20 h-12 m-2 ml-10 object-cover rounded-lg shadow-md"
                />
                <div className="ml-auto space-x-4 mr-10">
                    <button className="px-4 py-2 text-lg font-medium text-gray-700  hover:bg-gray-100 rounded-b-2xl transition">
                        About us
                    </button>
                    <button className="px-4 py-2 text-lg font-medium text-gray-700  hover:bg-gray-100 rounded-b-2xl transition">
                        New Here
                    </button>
                    {/* <Link to="/login"> */}
                    <button className="px-4 py-2 text-lg font-medium text-gray-700  hover:bg-gray-100 rounded-b-2xl transition" onClick={() => navigate('/login')}>
                        Login
                    </button>
                </div>
            </nav >
            <button
                onClick={Notify}
                className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-lg shadow transition"
            >
                Notify
            </button>
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-lg shadow transition"
            >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            {/* Main Content */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-between min-h-[calc(100vh-64px)] px-6 py-8 gap-8 text-center" >

                {/* Left Image with Caption */}
                <div className="w-full md:w-1/3 flex flex-col items-center" >
                    <img
                        src={Mapp}
                        alt="Map preview"
                        className="w-full max-h-96 object-cover rounded-lg shadow-md"
                    />
                    <p className="mt-2 text-xl text-gray-600">
                        🌍 Track users across the globe in real time.
                    </p>
                </div >

                {/* Text Section */}
                <div className="w-full md:w-1/3" >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900">
                        INSTANT INSANE TALKS
                    </h1>
                    <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-600 italic">
                        Seamless global messaging — stay connected wherever you are.
                    </p>
                </div >

                {/* Right Image with Caption */}
                <div className="w-full md:w-1/3 flex flex-col items-center" >
                    <img
                        src={Chat}
                        alt="Chat interface"
                        className="w-full max-h-96 object-cover rounded-lg shadow-md"
                    />
                    <p className="mt-2 text-xl text-gray-600">
                        💬 Instant messaging made seamless
                    </p>
                </div >

            </div >



        </div >
    )
}

export default LandingPage