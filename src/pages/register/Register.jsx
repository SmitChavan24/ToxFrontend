import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useForm } from 'react-hook-form'
import { ArrowLeft, Headphones, Eye, EyeOff } from 'lucide-react'
import { Button } from "../../components/ui/button"
import axios from 'axios'
const env = await import.meta.env;

const Register = () => {
    const navigate = useNavigate();
    const [apiError, setApiError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const schema = yup.object().shape({
        firstname: yup.string().required('First name is required').min(2, 'Min 2 characters'),
        lastname: yup.string().required('Last name is required').min(2, 'Min 2 characters'),
        email: yup.string().email('Must be a valid email').required('Email is required'),
        phone: yup.string().required("Phone is required").matches(/^[0-9]+$/, "Only digits").length(10, "Must be 10 digits"),
        organization: yup.string().required('Organization name is required').min(2, 'Min 2 characters'),
        password: yup.string().required('Password is required').min(6, 'Min 6 characters'),
        confirmpassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm password'),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ defaultValues: { createddate: new Date() }, resolver: yupResolver(schema) });

    const onSubmit = async (data) => {
        try {
            setApiError('')
            const response = await axios.post(`${env.VITE_SERVER_URL}register/`, data, {
                headers: { "Content-Type": "application/json" }
            })
            if (response.data.message) {
                navigate('/login');
            }
        } catch (error) {
            if (error?.response?.data?.error) {
                setApiError(error.response.data.error)
            } else {
                setApiError('Registration failed. Please try again.')
            }
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-violet-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="absolute left-6 top-6">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                </Button>
            </div>

            <div className="relative w-full max-w-lg">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
                        <Headphones className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create your account</h1>
                    <p className="text-gray-500 text-sm mt-1">Set up your team on HelpWave</p>
                </div>

                {/* Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">First name</label>
                                <input
                                    {...register("firstname")}
                                    maxLength={15}
                                    placeholder="Jane"
                                    className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                />
                                {errors.firstname && <p className="mt-1 text-xs text-red-400">{errors.firstname.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Last name</label>
                                <input
                                    {...register("lastname")}
                                    maxLength={15}
                                    placeholder="Doe"
                                    className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                />
                                {errors.lastname && <p className="mt-1 text-xs text-red-400">{errors.lastname.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Organization</label>
                            <input
                                {...register("organization")}
                                maxLength={50}
                                placeholder="Acme Inc."
                                className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            />
                            {errors.organization && <p className="mt-1 text-xs text-red-400">{errors.organization.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                {...register("email")}
                                maxLength={35}
                                placeholder="jane@acme.com"
                                className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
                            <input
                                type="text"
                                {...register("phone")}
                                maxLength={10}
                                placeholder="1234567890"
                                className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            />
                            {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    placeholder="••••••••"
                                    className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-11 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    {...register("confirmpassword")}
                                    placeholder="••••••••"
                                    className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-11 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.confirmpassword && <p className="mt-1 text-xs text-red-400">{errors.confirmpassword.message}</p>}
                        </div>

                        {apiError && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-400 text-center">{apiError}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] mt-2"
                        >
                            Create Account
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <button type="button" className="text-indigo-400 hover:text-indigo-300 font-medium transition" onClick={() => navigate('/login')}>
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register