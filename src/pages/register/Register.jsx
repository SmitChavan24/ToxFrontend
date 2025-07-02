import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from '../../components/ui/calendar'
import Logo from '../../assets/images/ToXLogo.png'
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useForm } from 'react-hook-form'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../components/ui/popover"
import { Button } from "../../components/ui/button"
import Confirmpassword from '../../screens/components/confirmpassword'
import axios from 'axios'

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showCalendar, setShowCalendar] = useState(false);
    const [apiError, setApiError] = useState('')
    const stepOneSchema = yup.object().shape({
        firstname: yup
            .string()
            .required('First name is required')
            .min(2, 'First name must be at least 2 characters'),
        lastname: yup
            .string()
            .required('Last name is required')
            .min(2, 'Last name must be at least 2 characters'),
        dateofbirth: yup
            .date()
            .typeError('Please enter a valid date')
            .required('Date of birth is required')
            .max(new Date(), 'Date of birth cannot be in the future')
            .test(
                'age',
                'You must be at least 5 years old',
                function (value) {
                    if (!value) return false;
                    const today = new Date();
                    const birthDate = new Date(value);
                    const age = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    return (
                        age > 5 || (age === 5 && m >= 0 && today.getDate() >= birthDate.getDate())
                    );
                }
            ),
        email: yup
            .string()
            .email('Must be a valid email')
            .required('Email is required'),
        gender: yup
            .string()
            .oneOf(['Male', 'Female', 'Other'], 'Select a valid gender')
            .required('Gender is required'),
    });

    const stepTwoSchema = yup.object().shape({
        password: yup.string().required('Password is required').min(6),
        confirmpassword: yup.string()
            .oneOf([yup.ref('password'), null], 'Passwords must match')
            .required('Confirm your password'),
    });

    const isStepOne = step === 1;

    const schema = isStepOne ? stepOneSchema : stepTwoSchema;

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({ defaultValues: { createddate: new Date() }, resolver: yupResolver(schema) });

    const selectedDate = watch('dateofbirth');

    const onSubmit = async (data) => {
        if (isStepOne) {
            setStep(2); // proceed to step 2 if step 1 is valid
        } else {
            // console.log('Final Submission', data);
            try {
                const response2 = await axios.post('http://localhost:3000/register/', data
                    ,
                    {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                console.log(response2.data.message)
                if (response2.data.message) {
                    navigate('/login');
                }
            } catch (error) {
                if (error?.response?.data?.error) {
                    setApiError(error.response.data.error)
                    console.log(error.response.data.error, "error")
                }
            }


        }
    }

    return (
        <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div
                aria-hidden="true"
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-1/2 -z-10 aspect-1155/678 w-144.5 max-w-none -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-40rem)] sm:w-288.75"
                />
            </div>
            <div className="mx-auto max-w-2xl text-center">
                <img
                    alt="Your Company"
                    src={Logo}
                    className="mx-auto h-10 w-auto"
                />


                {!isStepOne ? <p className="mt-2 text-lg/8 text-gray-600"> {`Please keep your password saved or you will lose your account`}</p> : <p className="mt-2 text-lg/8 text-gray-600">Start your exciting journey by filling this out</p>}

            </div>
            {/* <form onSubmit={() => navigate('/captureface')} className="mx-auto mt-16 max-w-xl sm:mt-20"> */}
            {/* <form onSubmit={handleSubmit(onSubmit)} className="mx-auto mt-16 max-w-xl sm:mt-20"> */}
            <form onSubmit={handleSubmit(onSubmit)} className="mx-auto mt-16 max-w-xl sm:mt-20">
                {isStepOne ? <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="first-name" className="block text-sm/6 font-semibold text-gray-900">
                            First name
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="first-name"
                                name="first-name"
                                type="text"
                                {...register("firstname", { required: true })}
                                autoComplete="given-name"
                                className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                            />
                            <p className="mt-1 text-center text-sm text-red-600">{errors.firstname?.message}</p>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="last-name" className="block text-sm/6 font-semibold text-gray-900">
                            Last name
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="last-name"
                                name="last-name"
                                type="text"
                                {...register("lastname", { required: true })}
                                autoComplete="family-name"
                                className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                            />
                            <p className="mt-1 text-center text-sm text-red-600">{errors.lastname?.message}</p>
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="company" className="block text-sm/6 font-semibold text-gray-900">
                            Date of birth
                        </label>
                        <div className="mt-2.5">
                            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowCalendar(true)}
                                        className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"

                                    >
                                        <CalendarIcon />
                                        {selectedDate ? selectedDate.toLocaleDateString() : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single"
                                        captionLayout="dropdown"
                                        selected={selectedDate}
                                        onSelect={(date) => { setValue('dateofbirth', date, { shouldValidate: true }); setShowCalendar(false); }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <p className="mt-1 text-center text-sm text-red-600">{errors.dateofbirth?.message}</p>
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="email" className="block text-sm/6 font-semibold text-gray-900">
                            Email
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                {...register("email", { required: true })}
                                className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                            />
                            <p className="mt-1 text-center text-sm text-red-600">{errors.email?.message}</p>
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="gender" className="block text-sm/6 font-semibold text-gray-900">
                            Gender
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            autoComplete="gender"
                            {...register("gender", { required: true })}
                            aria-label="Gender"
                            className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"                        >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                        <p className="mt-1 text-center text-sm text-red-600">{errors.gender?.message}</p>
                    </div>


                    {/* <Field className="flex gap-x-4 sm:col-span-2">
                        <div className="flex h-6 items-center">
                            <Switch
                                checked={agreed}
                                onChange={setAgreed}
                                className="group flex w-8 flex-none cursor-pointer rounded-full bg-gray-200 p-px ring-1 ring-gray-900/5 transition-colors duration-200 ease-in-out ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 data-checked:bg-indigo-600"
                            >
                                <span className="sr-only">Agree to policies</span>
                                <span
                                    aria-hidden="true"
                                    className="size-4 transform rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition duration-200 ease-in-out group-data-checked:translate-x-3.5"
                                />
                            </Switch>
                        </div>
                        <Label className="text-sm/6 text-gray-600">
                            By selecting this, you agree to our{' '}
                            <a href="#" className="font-semibold text-indigo-600">
                                privacy&nbsp;policy
                            </a>
                            .
                        </Label>
                    </Field> */}
                </div> : <Confirmpassword register={register} errors={errors} apiError={apiError} />}
                <div className="mt-10">
                    <p className="mt-1 text-center text-sm text-red-600">{apiError}</p>
                    <button
                        type="submit"
                        className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        {isStepOne ? "Next" : "Register"}
                    </button>
                    {!isStepOne && <button
                        onClick={() => { setStep(1); setApiError('') }}
                        className="block w-full rounded-md mt-20 bg-fuchsia-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Go Back
                    </button>}
                </div>
            </form>
        </div>
    )
}

export default Register