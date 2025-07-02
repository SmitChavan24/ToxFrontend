import React, { useState } from 'react'

const Confirmpassword = ({ register, errors, apiError }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // console.log(errors)
    return (
        <div>
            <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm/6 font-semibold text-gray-900">
                    Password
                </label>
                <div className="mt-2.5">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...register('password')}
                        onMouseOver={() => setShowPassword(true)}
                        onMouseOut={() => setShowPassword(false)}
                        className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                    />
                    <p className="mt-1 text-center text-sm text-red-600">{errors?.password?.message}</p>
                </div>
            </div>
            <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm/6 font-semibold text-gray-900">
                    Confirm Password
                </label>
                <div className="mt-2.5">
                    <input
                        id="confirmpassword"
                        type={showConfirmPassword ? "text" : "password"}
                        {...register('confirmpassword')}
                        onMouseOver={() => setShowConfirmPassword(true)}
                        onMouseOut={() => setShowConfirmPassword(false)}
                        // {...register("email", { required: true })}
                        className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                    />
                    <p className="mt-1 text-center text-sm text-red-600">{errors?.confirmpassword?.message}</p>
                </div>
            </div>
        </div>
    )
}

export default Confirmpassword