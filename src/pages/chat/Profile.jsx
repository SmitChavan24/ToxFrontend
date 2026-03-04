import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useAuthStore from "../../../store/store";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, X } from "lucide-react";

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
    const navigate = useNavigate();
    const [profilePic, setProfilePic] = useState("");
    const setUser = useAuthStore((state) => state.setUser);
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(profileSchema),
    });
    const watchAllFields = watch();

    useEffect(() => {
        const storedData = sessionStorage.getItem("UserInfo");
        const existingData = storedData ? JSON.parse(storedData) : {};
        const existingUser = existingData?.user || {};

        const hasChanged =
            profilePic !== (existingUser.picture || "") ||
            Object.keys(watchAllFields).some(
                (key) => (watchAllFields[key] || "") !== (existingUser[key] || "")
            );

        console.log(hasChanged, "afdaf");
        console.log(watchAllFields, existingUser);
    }, [watchAllFields, profilePic]);

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
        const storedData = sessionStorage.getItem("UserInfo");
        let existingData = storedData ? JSON.parse(storedData) : {};

        const updatedUser = {
            ...existingData.user,
            ...data,
            picture: profilePic,
            dob: data.dob,
        };

        const updatedData = {
            ...existingData,
            user: updatedUser,
        };

        setUser(updatedData);
        navigate("/chat");
    };

    const goBack = () => navigate("/chat");

    return (
        <div className="min-h-screen h-[100dvh] bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* ─── Sticky Header ─── */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
                <button
                    onClick={goBack}
                    className="flex items-center gap-2 p-2 -ml-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-sm font-medium hidden sm:inline">
                        Back to Chat
                    </span>
                </button>

                <h1 className="text-base font-bold text-gray-800 dark:text-white">
                    Agent Profile
                </h1>

                <button
                    onClick={goBack}
                    className="p-2 -mr-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition"
                    title="Close"
                >
                    <X className="h-5 w-5" />
                </button>
            </header>

            {/* ─── Scrollable Content ─── */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl w-full p-6 sm:p-10">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* ─── Profile Picture ─── */}
                            <div className="flex flex-col items-center md:w-1/3">
                                <div className="relative group">
                                    {profilePic ? (
                                        <img
                                            src={profilePic}
                                            alt="Profile"
                                            className="h-28 w-28 sm:h-32 sm:w-32 rounded-full object-cover border-4 border-blue-400 dark:border-blue-500 shadow-md"
                                        />
                                    ) : (
                                        <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 border-4 border-blue-400 dark:border-blue-500 shadow-md flex items-center justify-center">
                                            <span className="text-white text-3xl font-bold">
                                                {watchAllFields?.name
                                                    ? watchAllFields.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase()
                                                        .slice(0, 2)
                                                    : "?"}
                                            </span>
                                        </div>
                                    )}

                                    {/* Camera overlay */}
                                    <label className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center cursor-pointer transition-all duration-200">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePictureChange}
                                        />
                                        <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                    </label>

                                    {/* Small camera badge */}
                                    <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 active:scale-90 transition shadow-md group-hover:scale-110">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePictureChange}
                                        />
                                        <Camera className="h-4 w-4 text-white" />
                                    </label>
                                </div>

                                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 text-center">
                                    Tap to change photo
                                </p>
                            </div>

                            {/* ─── Form ─── */}
                            <form
                                className="md:w-2/3 flex flex-col gap-4"
                                onSubmit={handleSubmit(onSubmit)}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            {...register("name")}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-xs mt-1.5">
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            {...register("email")}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-xs mt-1.5">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            {...register("phone")}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        {errors.phone && (
                                            <p className="text-red-500 text-xs mt-1.5">
                                                {errors.phone.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Date of Birth */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            {...register("dob")}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        {errors.dob && (
                                            <p className="text-red-500 text-xs mt-1.5">
                                                {errors.dob.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Gender */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                                            Gender
                                        </label>
                                        <select
                                            {...register("gender")}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.gender && (
                                            <p className="text-red-500 text-xs mt-1.5">
                                                {errors.gender.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* ─── Action Buttons ─── */}
                                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-[0.98] transition font-medium shadow-sm"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={goBack}
                                        className="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-[0.98] transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}