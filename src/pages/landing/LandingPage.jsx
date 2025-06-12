import React from 'react'
import Chat from '../../assets/images/map.jpg'
import Mapp from '../../assets/images/chat.jpg'
import Logo from '../../assets/images/ToXlogo.png'
import { useNavigate } from 'react-router-dom'
const LandingPage = () => {
    const navigate = useNavigate();

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
                        Tox
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