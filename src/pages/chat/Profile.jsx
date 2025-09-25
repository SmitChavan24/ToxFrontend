import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useAuthStore from "../../../store/store";
import { useNavigate } from "react-router-dom";

// Validation schema
const profileSchema = yup.object().shape({
    name: yup
        .string()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters"),
    email: yup.string().email("Must be a valid email").required("Email is required"),
    phone: yup
        .string()
        .required("Phone is required")
        .matches(/^[0-9]+$/, "Phone must contain only digits")
        .length(10, "Phone must be exactly 10 digits"),
    dob: yup
        .date()
        .typeError("Please enter a valid date")
        .required("Date of birth is required")
        .max(new Date(), "Date of birth cannot be in the future")
        .test("age", "You must be at least 5 years old", function (value) {
            if (!value) return false;
            const today = new Date();
            const birthDate = new Date(value);
            const age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            return age > 5 || (age === 5 && m >= 0 && today.getDate() >= birthDate.getDate());
        }),
    gender: yup
        .string()
        .oneOf(["Male", "Female", "Other"], "Select a valid gender")
        .required("Gender is required"),
});

export default function ProfilePage() {
    const navigate = useNavigate()
    const [profilePic, setProfilePic] = useState("");
    const setUser = useAuthStore((state) => state.setUser);
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(profileSchema),
    });

    // Load user data from sessionStorage
    useEffect(() => {
        const storedUser = sessionStorage.getItem("UserInfo");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setValue("name", parsedUser?.user?.name || "");
            setValue("email", parsedUser?.user?.email || "");
            setValue("phone", parsedUser?.user?.phone || "");
            setValue("dob", parsedUser?.user?.dob ? parsedUser?.user?.dob.split("T")[0] : "");
            setValue("gender", parsedUser?.user?.gender || "");
            setProfilePic(parsedUser?.user?.picture || "");
        }
    }, [setValue]);

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProfilePic(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = (data) => {
        // Get the full stored object from sessionStorage
        const storedData = sessionStorage.getItem("UserInfo");
        let existingData = storedData ? JSON.parse(storedData) : {};

        // Merge the existing user with updated fields
        const updatedUser = {
            ...existingData.user,   // keep old fields (_id, id, createddate, password, __v)
            ...data,                // overwrite with new fields from form
            picture: profilePic,    // update picture
            dob: data.dob           // ensure dob comes from form (ISO format if needed)
        };

        // Build the full object with token and message preserved
        const updatedData = {
            ...existingData,
            user: updatedUser
        };

        // Save to Zustand and sessionStorage
        setUser(updatedData);
        // sessionStorage.setItem("UserInfo", JSON.stringify(updatedData));

        navigate('/chat');
    };


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-start py-20">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl w-full max-w-4xl p-10">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                    Edit Profile
                </h2>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center md:w-1/3">
                        <div className="relative">
                            <img
                                src={profilePic || "https://via.placeholder.com/150"}
                                // alt="Profile"
                                className="h-32 w-32 rounded-full object-cover border-4 border-blue-400"
                            />
                            <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition">
                                <input type="file" accept="image/*" className="hidden" onChange={handlePictureChange} />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </label>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="md:w-2/3 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-200 mb-1">Name</label>
                                <input
                                    type="text"
                                    {...register("name")}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-gray-700 dark:text-gray-200 mb-1">Email</label>
                                <input
                                    type="email"
                                    {...register("email")}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-gray-700 dark:text-gray-200 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    {...register("phone")}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                            </div>

                            <div>
                                <label className="block text-gray-700 dark:text-gray-200 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    {...register("dob")}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-gray-700 dark:text-gray-200 mb-1">Gender</label>
                                <select
                                    {...register("gender")}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="mt-6 py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                        >
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
