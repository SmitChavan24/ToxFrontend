import React, { useEffect, useState } from 'react'
import { GoogleLogin, } from '@react-oauth/google';
import Logo from '../../assets/images/ToXLogo.png'
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useAuth } from '../../context/Authcontext';
import useNetworkStatus from '../../utils/networkstatus';
const env = await import.meta.env;

const Login = () => {
    const { isOnline } = useNetworkStatus();
    console.log(isOnline, "afasf")
    const navigate = useNavigate();
    const { setUserInfo } = useAuth()
    const schema = yup.object().shape({
        email: yup
            .string()
            .email('Must be a valid email')
            .required('Email is required'),
        password: yup.string().required('Password is required').min(6),
    });
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({ defaultValues: {}, resolver: yupResolver(schema) });

    useEffect(() => {
        const apicall = async () => {
            // const response = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
            //     headers: {
            //         Authorization: `Bearer ${user.access_token}`,
            //         Accept: 'application/json'
            //     }
            // })
            // const response = await axios.get(`${env.VITE_SERVER_URL}`)
            // console.log(response, "responsee")


        }
        apicall()
    }, [])

    const GoogleDecode = async (creds) => {
        console.log(creds)
        const response = await axios.post(`${env.VITE_SERVER_LURL}google-auth/`, creds
            ,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            })

        if (response.data.payload) {
            const response2 = await axios.post(`${env.VITE_SERVER_LURL}gsignin/`, response.data.payload
                ,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                })


            if (response2.data.message == "Login successful") {
                console.log(response2.data)
                localStorage.setItem('UserInfo', JSON.stringify(response2.data))
                navigate('/chat')
            }
        }

    }

    const Login = async (data) => {
        const response = await axios.post(`${env.VITE_SERVER_LURL}login/`, data)

        if (response.data.message == "Login successful") {

            localStorage.setItem('UserInfo', JSON.stringify(response.data))
            setUserInfo(response.data)
            navigate('/chat')
        }
    }

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        alt="Your Company"
                        src={Logo}
                        className="mx-auto h-10 w-auto"
                    />
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Login in to your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form onSubmit={handleSubmit(Login)} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    {...register("email", { required: true })}
                                    autoComplete="email"
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                    Password
                                </label>
                                <div className="text-sm">
                                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                        Forgot password?
                                    </a>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    {...register("password", { required: true })}
                                    required
                                    autoComplete="current-password"
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>

                    <div className="mt-10 text-center text-sm/6 justify-items-center text-gray-500">


                        <GoogleLogin
                            onSuccess={GoogleDecode}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                        />
                    </div>
                    <p className="mt-10 text-center text-sm/6 text-gray-500">
                        Not a member?{' '}
                        <button
                            type="button"
                            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                            onClick={() => navigate('/register')} >
                            Register
                        </button>
                    </p>
                </div>
            </div>
        </>
    )
}

export default Login