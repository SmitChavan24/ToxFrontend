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
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/store";
// import { socket } from "../../utils/socket/socketserver";
const env = await import.meta.env;



const ChatPage = ({ }) => {
    const navigate = useNavigate()
    // const { userInfo, history, setHistory } = useAuth()
    const { userInfo, history, setUserInfo, setHistory } = useAuthStore();
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [usersData, setUsersData] = useState([])
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const historyRef = useRef(history);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    useEffect(() => {
        historyRef.current = history;
    }, [history]);

    // useEffect(() => {
    //     socket.on("messageResponse", (data) => setMessages([...messages, data]));
    // }, [socket, messages]);

    useEffect(() => {

        if (!userInfo?.user?.id) return;

        const socket = io("http://localhost:3000", {
            transports: ['websocket'],
            query: { id: userInfo.user.id },
        });

        socket.once("connect", () => {
            console.log("Connected to socket server!");
        });

        socket.on("online", (userId) => {
            const updatedHistory = historyRef.current.map(user => {
                if (user.id === userId) {
                    return { ...user, status: "online" };
                }
                return user;
            });
            setHistory(updatedHistory);
            // Notify(userId, "Online");
        });

        socket.on("offline", (userId) => {
            const updatedHistory = historyRef.current.map(user => {
                if (user.id === userId) {
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


    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

    const Notify = (userId, status) => {
        const user = history.find(u => u.id === userId);
        const text = `👤 ${user?.name || "A user"} is now ${status}.`;
        new Notification(`Hey`, { body: text });
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


    }

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearch(value)
        try {
            const res = await axios.get(`http://localhost:3000/searchbyemail?email=${value}`);
            if (res?.data?.users) {
                setUsersData(res.data.users);
            } else {
                setUsersData([])
            }
        } catch (err) {
            setUsersData([])
            console.error('Failed to fetch users:', err);
        }
    };

    const handleSendMessage = (e) => {
        // e.preventDefault();
        console.log(message)
        socket.emit("message", {
            text: message,
            name: "smit",
            id: `${socket.id}${Math.random()}`,
            socketID: socket.id,
        });

        setMessage("");
    };

    const SetHistory = async (user) => {
        setUsersData([])
        setSelectedUser(user);
        setMessages([]);

        // Check if user is already in history (using `_id` or `id`)
        const isUserPresent = history.some(
            (u) => u.id === user.id
        );
        // If not present, add to history and update localStorage
        if (!isUserPresent) {
            let newhistory = [];
            newhistory = history;
            newhistory.push(user)
            setHistory(newhistory)
            localStorage.setItem('Husers', JSON.stringify(newhistory));
        }
    }
    const handleSend = () => {
        SpeechRecognition.stopListening()
        if (transcript.trim() === '') return;
        setMessages([...messages, { sender: 'me', text: transcript }]);
        setNewMsg('');
        resetTranscript()
    };

    return (
        <div className="flex flex-col h-screen">
            {/* 🔵 Navigation Bar */}
            <div className="bg-white shadow px-6 py-4 flex justify-between items-center border-b">
                <h1 className="text-xl font-semibold">TOX</h1>
                <div className="flex items-center gap-3">
                    <img
                        src={userInfo?.user?.picture || Profile}
                        alt="User"
                        className="h-10 w-10 rounded-full"
                    />
                    <span className="text-gray-700">{userInfo?.user?.name}</span>
                    <button className="text-gray-700" onClick={() => { localStorage.removeItem('UserInfo'); navigate('/login') }}>Logout</button>
                </div>
            </div>

            {/* 🔵 Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r p-4 flex flex-col">

                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
                    />


                    {/* User List */}
                    <div className="flex-1 overflow-y-auto mt-3">
                        {usersData
                            .filter((user) => user?.id !== userInfo?.user?.id)
                            .map((user) => (
                                <div
                                    key={user?.id}
                                    onClick={() => SetHistory(user)}
                                    className={`p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-100 ${selectedUser?.id === user?.id ? 'bg-gray-200' : ''
                                        }`}
                                >
                                    <h3 className="font-semibold">{user?.name}</h3>
                                </div>
                            ))}

                        {history.map((user) => (<div
                            key={user?.id}
                            onClick={() => setSelectedUser(user)}
                            className={`flex justify-between items-center p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-100 ${selectedUser?.id === user?.id ? 'bg-gray-200' : ''
                                }`}
                        >
                            <div>
                                <h3 className="font-semibold">{user?.name}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-3 w-3 rounded-full ${user?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                        }`}
                                ></span>
                                {/* <span className="text-sm font-medium capitalize">{user?.status}</span> */}
                            </div>
                        </div>))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 bg-gray-50 flex flex-col">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b">
                                <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                                <h3>{selectedUser.email}</h3>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`max-w-xs p-2 rounded-lg ${msg.sender === 'me'
                                            ? 'ml-auto bg-blue-500 text-white'
                                            : 'bg-gray-200 text-black'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={transcript}
                                    onChange={() => setMessage(transcript)}
                                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring"
                                />
                                <button
                                    onClick={() => SpeechRecognition.startListening({ continuous: true })}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Start
                                </button>
                                <button
                                    onClick={handleSend}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Send
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Select a user to start chatting
                        </div>
                    )}
                </div>
            </div>
        </div>)
    // return (
    //     <Card className="@container/cards bg-gray-100">
    //         <p>Microphone: {listening ? 'on' : 'off'}</p>
    //         {/* <!-- Incoming message --> */}
    //         <div class="flex items-start">
    //             <div class="bg-white text-gray-800 px-4 py-2 rounded-lg rounded-bl-none shadow">
    //                 {transcript}
    //             </div>
    //         </div>

    //         {/* <!-- Outgoing message --> */}
    //         {/* <div class="flex justify-end">
    //             <div class="bg-blue-500 text-white px-4 py-2 rounded-lg rounded-br-none shadow">
    //                 I'm good! You?
    //             </div>
    //         </div> */}

    //         <Button onClick={() => SpeechRecognition.startListening({ continuous: true })}>Start</Button>
    //         <Button onClick={SpeechRecognition.stopListening}>Stop</Button>
    //         <Button onClick={resetTranscript}>Reset</Button>
    //         <Button onClick={CallGif}>CallGif</Button>
    //         <Input type="text" placeholder="Type Message" />
    //     </Card>
    // );
};

export default ChatPage;
