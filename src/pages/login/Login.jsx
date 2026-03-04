
import React, { useEffect, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { ArrowLeft, Headphones, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import useAuthStore from '../../../store/store';
import useNetworkStatus from '../../utils/networkstatus';
const env = await import.meta.env;

const Login = () => {
    const { isOnline } = useNetworkStatus();
    const navigate = useNavigate();
    const [apiError, setApiError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const { userInfo } = useAuthStore()
    const setUser = useAuthStore((state) => state.setUser);

    const schema = yup.object().shape({
        email: yup.string().required('Email is required'),
        password: yup.string().required('Password is required').min(6),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ defaultValues: {}, resolver: yupResolver(schema) });

    useEffect(() => {
        if (userInfo?.user?.id) {
            navigate('/dashboard');
        }
    }, []);

    const GoogleDecode = async (creds) => {
        try {
            setApiError('');
            const response = await axios.post(
                `${env.VITE_SERVER_URL}google-auth/`,
                creds,
                { headers: { "Content-Type": "application/json" } }
            );
            if (response.data.message === "Login successful") {
                setUser(response.data);
                navigate("/dashboard");
            }
        } catch (error) {
            setApiError(error?.response?.data?.message || "Google login failed. Please try again.");
        }
    };

    const LoginSubmit = async (data) => {
        try {
            const response = await axios.post(`${env.VITE_SERVER_URL}login/`, data)
            if (response.data.message === "Login successful") {
                setUser(response.data)
                navigate('/dashboard')
            } else {
                setApiError(response.data.message)
            }
        } catch (error) {
            if (error) {
                setApiError(error.response.data.message)
            }
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-indigo-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="absolute left-6 top-6">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/")}
                    className="flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
                        <Headphones className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                    <p className="text-gray-500 text-sm mt-1">Sign in to your HelpWave dashboard</p>
                </div>

                {/* Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <form onSubmit={handleSubmit(LoginSubmit)} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                required
                                {...register("email", { required: true })}
                                autoComplete="email"
                                placeholder="agent@company.com"
                                className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", { required: true })}
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-11 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                        </div>

                        {apiError && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-400 text-center">{apiError}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-xs text-gray-500">or continue with</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={GoogleDecode}
                            onError={() => setApiError('Google login failed. Please try again.')}
                            theme="filled_black"
                            shape="pill"
                        />
                    </div>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            className="text-indigo-400 hover:text-indigo-300 font-medium transition"
                            onClick={() => navigate('/register')}
                        >
                            Create one
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login