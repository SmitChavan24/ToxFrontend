import React, { use, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
    Card,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "../../components/ui/button";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import axios from "axios";
import Profile from '../../assets/images/profile.png'
import { useAuth } from "../../context/Authcontext";
import { Moon, Sun, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/store";
import EmojiGifBox from "../../screens/components/emojipicker";
import { showNotification } from "../../screens/components/shownotification";
// navigator.serviceWorker.register("sw.js");
// import { socket } from "../../utils/socket/socketserver";
const env = await import.meta.env;

let socket;

const ChatPage = ({ }) => {
    const navigate = useNavigate()
    // const { userInfo, history, setHistory } = useAuth()
    const { userInfo, history, setUserInfo, setHistory, removeUser, loadFromLocalStorage } = useAuthStore();
    const [unreadCounts, setUnreadCounts] = useState({});
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [usersData, setUsersData] = useState([])
    const [gifResults, setGifResults] = useState([]);
    const [darkMode, setDarkMode] = useState(false);
    // const [messages, setMessages] = useState([]);
    const [messages, setMessages] = useState({});
    const [abortController, setAbortController] = useState(new
        AbortController());
    const [isListening, setIsListening] = useState(false);
    const historyRef = useRef(history);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition({
        interimResults: true, // Get partial results
        continuous: true, // Enable continuous recognition
        maxAlternatives: 5, // Set the number of alternative transcriptions
        abortController: new AbortController(),
    });

    useEffect(() => {
        loadFromLocalStorage()
        checkOnlineUsers()
    }, []);

    useEffect(() => {
        historyRef.current = history;
    }, [history]);

    useEffect(() => {
        if (transcript && transcript !== "") {
            setMessage(prev => (prev + " " + transcript).trim());
            resetTranscript(); // important to prevent repeated appends
        }
    }, [transcript]);

    // useEffect(() => {
    //     socket.on("messageResponse", (data) => setMessages([...messages, data]));
    // }, [socket, messages]);

    useEffect(() => {

        if (!userInfo?.user?.id) return;

        socket = io(env.VITE_SERVER_LURL, {
            transports: ['websocket'],
            query: { id: userInfo?.user?.id },
        });

        socket.once("connect", () => {
            console.log("Connected to socket server!");
        });

        socket.on("receive_message", (data) => {
            console.log(data, 'receive_messagex ')
            if (data.sender) {
                SetHistory(data.sender)
            }
            if (!selectedUser || selectedUser?.id !== data?.sender?.id) {
                setUnreadCounts((prev) => ({
                    ...prev,
                    [data?.sender?.id]: (prev[data?.sender?.id] || 0) + 1
                }));
            }
            setMessages((prev) => ({
                ...prev,
                [data?.sender?.id]: [...(prev[data?.sender?.id] || []), { sender: data?.sender, message: data?.message }],
            }));
            MNotification(data?.sender, data?.message)
        });

        socket.on("online", (userId) => {
            const updatedHistory = historyRef.current.map(user => {
                if (user.id === userId) {
                    return { ...user, status: "online" };
                }
                return user;
            });
            setHistory(updatedHistory);
            Notify(userId, "Online");
        });

        socket.on("offline", (userId) => {
            const updatedHistory = historyRef.current.map(user => {
                if (user?.id === userId) {
                    return { ...user, status: "offline" };
                }
                return user;
            });
            setHistory(updatedHistory);
            // Notify(userId, "Offline");
        });

        return () => {
            socket.off("online");
            socket.off("offline");
            socket.disconnect();
        };
    }, [userInfo?.user?.id]);

    const checkOnlineUsers = async () => {
        try {
            const response = await axios.post(`${env.VITE_SERVER_LURL}online-users`, history, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const { onlineUserIds } = response.data;

            const updatedHistory = historyRef.current.map(user => ({
                ...user,
                status: onlineUserIds.includes(user?.id) ? 'online' : 'offline'
            }));

            setHistory(updatedHistory);

        } catch (error) {
            console.error('Error checking online users:', error);
            return [];
        }
    };

    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

    const Notify = (userId, status) => {
        const user = history.find(u => u?.id === userId);
        const text = `👤 ${user?.name || "A user"} is now ${status}.`;
        showNotification('Hey', text)
    };

    const MNotification = (user, data) => {
        console.log(user, data, "dassadasd")
        const text = `👤 ${user?.name || "A user"} has sent you a message.`;

        if (data.isGif) {

            let icon = extractGifUrlFromText(data.text); // <- see below
            new Notification(`${text}`, { body: "", icon: icon });
        } else {
            showNotification(text, data.text)
            // new Notification(`${text}`, { body: data.text });
        }

    };

    const extractGifUrlFromText = (html) => {
        const match = html.match(/<img[^>]+src="([^">]+)"/);
        return match ? match[1] : "/default-icon.png";
    };
    const CallGif = async (gif) => {
        const API_KEY = import.meta.env.VITE_GIF_KEY;
        // console.log(API_KEY)
        const SEARCHGIF = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=dawai&limit=${10}`
        const SEARCHSTICK = `https://api.giphy.com/v1/stickers/search?api_key=${API_KEY}&q=dawai&limit=${10}`
        const URLGIF = `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=${20}`
        const URLSTICK = `https://api.giphy.com/v1/stickers/trending?api_key=${API_KEY}&limit=${20}`

        const Gifresponse = await axios.get(SEARCHSTICK)
        console.log(Gifresponse)
        const gifs = Gifresponse.data.data; // Giphy returns array in data.data
        setGifResults(gifs);

    }
    const handleInputChange = (e) => {
        setMessage(e.target.value);
    };
    const logoutuser = () => {
        sessionStorage.removeItem('UserInfo');
        removeUser();
        navigate('/login');
    }
    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearch(value)
        try {
            const res = await axios.get(`${env.VITE_SERVER_LURL}searchbyemail?email=${value}`);
            if (res?.data?.users) {
                setUsersData(res?.data?.users);
            } else {
                setUsersData([])
            }
        } catch (err) {
            setUsersData([])
            console.error('Failed to fetch users:', err);
        }
    };


    const SetHistory = async (user) => {
        setUsersData([])
        setSelectedUser(user);
        setMessages([]);

        // Check if user is already in history (using `_id` or `id`)
        const isUserPresent = history.some(
            (u) => u?.id === user?.id
        );
        // If not present, add to history and update localStorage
        if (!isUserPresent) {
            let newhistory = [];
            newhistory = history;
            newhistory.push(user)
            setHistory(newhistory)
            sessionStorage.setItem('Husers', JSON.stringify(newhistory));
        }
    }
    const handleSend = (file = null) => {
        if (!selectedUser) return;

        const toUserId = selectedUser.id;

        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const smessage = {
                    type: file.type.startsWith("video") ? "video" : "image",
                    fileUrl: reader.result, // base64
                    timestamp: new Date()
                };

                // Emit to socket
                socket.emit("send_message", {
                    toUserId,
                    message: smessage,
                    from: userInfo.user
                });

                // Update local chat
                setMessages((prev) => ({
                    ...prev,
                    [toUserId]: [
                        ...(prev[toUserId] || []),
                        { sender: userInfo?.user, message: smessage }
                    ],
                }));
            };

            // Use readAsDataURL for both images and videos
            reader.readAsDataURL(file);
            return;
        }

        // Text message
        if (message.trim() === '') return;

        const smessage = { text: message, timestamp: new Date() };

        socket.emit("send_message", { toUserId, message: smessage, from: userInfo.user });

        setMessages((prev) => ({
            ...prev,
            [toUserId]: [...(prev[toUserId] || []), { sender: userInfo?.user, message: smessage }],
        }));

        setMessage('');
    };




    const handleSendGif = (gifUrl) => {
        if (!selectedUser) return;
        const toUserId = selectedUser.id;
        const smessage = {
            text: `<img src="${gifUrl}" alt="gif" />`,
            timestamp: new Date().toISOString(),
            isGif: true
        }

        socket.emit("send_message", {
            toUserId,
            message: smessage,
            from: userInfo?.user
        });

        setMessages((prev) => ({
            ...prev,
            [toUserId]: [...(prev[toUserId] || []), { sender: userInfo?.user, message: smessage }],
        }));

        setGifResults([]); // clear gifs after send
    };

    const chatMessages = messages[selectedUser?.id] || [];

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* 🔵 Navigation Bar */}
            <div className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 shadow-md px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    TOX
                </h1>

                <div className="flex items-center gap-4">
                    <img
                        src={userInfo?.user?.picture || Profile}
                        alt="User"
                        className="h-10 w-10 rounded-full ring-2 ring-blue-500/40"
                    />

                    <div className="flex flex-col">
                        <span className="text-gray-800 dark:text-gray-200 font-medium">
                            {userInfo?.user?.name}
                        </span>
                        <button
                            onClick={() => {
                                navigate('/profile')
                            }}
                            className="text-blue-500 text-sm hover:underline mt-1"
                        >
                            Edit Profile
                        </button>
                    </div>

                    <button
                        onClick={logoutuser}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                        Logout
                    </button>
                </div>
            </div>



            {/* 🔵 Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-full md:w-1/3 lg:w-1/4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col shadow-inner">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="🔍 Search by name, email, or phone..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition placeholder-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                    />


                    {/* User List */}
                    <div className="flex-1 overflow-y-auto mt-4 space-y-2">
                        {usersData
                            .filter((user) => user?.id !== userInfo?.user?.id)
                            .map((user) => (
                                <div
                                    key={user?.id}
                                    onClick={() => SetHistory(user)}
                                    className={`p-3 rounded-xl cursor-pointer transition hover:shadow-md hover:bg-blue-50 dark:hover:bg-gray-700 ${selectedUser?.id === user?.id
                                        ? "bg-blue-100 dark:bg-gray-700 shadow-inner"
                                        : "bg-white dark:bg-gray-800"
                                        }`}
                                >
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{user?.name}</h3>
                                </div>
                            ))}

                        {history.map((user) => (
                            <div
                                key={user?.id}
                                onClick={() => {
                                    setSelectedUser(user);
                                    setUnreadCounts((prev) => {
                                        const updated = { ...prev };
                                        delete updated[user?.id];
                                        return updated;
                                    });
                                }}
                                className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition hover:shadow-md hover:bg-blue-50 dark:hover:bg-gray-700 ${selectedUser?.id === user?.id
                                    ? "bg-blue-100 dark:bg-gray-700 shadow-inner"
                                    : "bg-white dark:bg-gray-800"
                                    }`}
                            >
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{user?.name}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {unreadCounts[user?.id] > 0 && (
                                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow">
                                            {unreadCounts[user?.id]}
                                        </span>
                                    )}
                                    <span
                                        className={`h-3 w-3 rounded-full ${user?.status === "online" ? "bg-green-500" : "bg-gray-400"
                                            }`}
                                    ></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex flex-col">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {selectedUser.name}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {selectedUser.email}
                                </p>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                                {chatMessages.map((msg, index) => (
                                    <div key={index} className="flex flex-col">
                                        <div
                                            className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl shadow-sm transition ${msg?.sender?.id === userInfo?.user?.id
                                                ? "ml-auto bg-blue-600 text-white rounded-br-none"
                                                : "mr-auto bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200 rounded-bl-none"
                                                }`}
                                        >
                                            {msg?.message?.fileUrl ? (
                                                msg?.message?.type === "image" ? (
                                                    <img
                                                        src={msg.message.fileUrl}
                                                        alt="uploaded"
                                                        className="max-w-[250px] rounded-lg shadow-md"
                                                    />
                                                ) : (
                                                    <video
                                                        src={msg.message.fileUrl}
                                                        controls
                                                        className="max-w-[250px] rounded-lg shadow-md"
                                                    />
                                                )
                                            ) : (
                                                <p className="text-sm leading-relaxed">{msg?.message?.text}</p>
                                            )}
                                        </div>
                                        <div
                                            className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${msg?.sender?.id === userInfo?.user?.id ? "text-right" : "text-left"
                                                }`}
                                        >
                                            {msg?.sender?.id === userInfo?.user?.id ? "" : msg?.sender?.name} •{" "}
                                            {new Date(msg?.message?.timestamp).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>


                            {/* Input */}
                            <div className="p-4 border-t bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center gap-3 border-gray-200 dark:border-gray-700">


                                {/* Text input */}
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={message}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && message.trim() !== "") {
                                            handleSend();
                                        }
                                    }}
                                    className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                                />
                                {/* Upload button */}
                                <label className="cursor-pointer flex items-center px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                                    📎
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                handleSend(file); // send as file message
                                            }
                                        }}
                                    />
                                </label>
                                {/* Send button */}
                                <button
                                    onClick={handleSend}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow"
                                >
                                    Send
                                </button>
                            </div>

                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg">
                            👋 Select a user to start chatting
                        </div>
                    )}
                </div>

            </div>
        </div>
    )

};

export default ChatPage;
