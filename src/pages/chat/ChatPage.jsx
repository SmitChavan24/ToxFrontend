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
import EmojiGifBox from "../../screens/components/emojipicker";
// import { socket } from "../../utils/socket/socketserver";
const env = await import.meta.env;

let socket;

const ChatPage = ({ }) => {
    const navigate = useNavigate()
    // const { userInfo, history, setHistory } = useAuth()
    const { userInfo, history, setUserInfo, setHistory } = useAuthStore();
    const [unreadCounts, setUnreadCounts] = useState({});
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [usersData, setUsersData] = useState([])
    const [gifResults, setGifResults] = useState([]);

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
            query: { id: userInfo.user.id },
        });

        socket.once("connect", () => {
            console.log("Connected to socket server!");
        });

        socket.on("receive_message", (data) => {
            console.log(data, 'receive_messagex ')

            if (!selectedUser || selectedUser?.id !== data.sender.id) {
                setUnreadCounts((prev) => ({
                    ...prev,
                    [data.sender.id]: (prev[data.sender.id] || 0) + 1
                }));
            }
            setMessages((prev) => ({
                ...prev,
                [data.sender.id]: [...(prev[data.sender.id] || []), { sender: data.sender, message: data.message }],
            }));
            MNotification(data.sender, data.message)
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
                status: onlineUserIds.includes(user.id) ? 'online' : 'offline'
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
        const user = history.find(u => u.id === userId);
        const text = `👤 ${user?.name || "A user"} is now ${status}.`;
        new Notification(`Hey`, { body: text });
    };

    const MNotification = (user, data) => {
        console.log(user, data, "dassadasd")
        const text = `👤 ${user?.name || "A user"} has sent you a message.`;

        if (data.isGif) {

            let icon = extractGifUrlFromText(data.text); // <- see below
            new Notification(`${text}`, { body: "", icon: icon });
        } else {
            new Notification(`${text}`, { body: data.text });
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

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearch(value)
        try {
            const res = await axios.get(`${env.VITE_SERVER_LURL}searchbyemail?email=${value}`);
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
        abortController.abort();
        setIsListening(false);
        if (message.trim() === '') return;
        const toUserId = selectedUser.id
        const smessage = { text: message, timestamp: new Date() }
        socket.emit("send_message", {
            toUserId,
            message: smessage,
            from: userInfo.user
        });
        setMessages((prev) => ({
            ...prev,
            [toUserId]: [...(prev[toUserId] || []), { sender: userInfo?.user, message: smessage }],
        }));
        // setMessages([...messages, { sender: userInfo?.user, message: smessage }]);
        setMessage('');
        resetTranscript();
        setAbortController(new AbortController());
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
            from: userInfo.user
        });

        setMessages((prev) => ({
            ...prev,
            [toUserId]: [...(prev[toUserId] || []), { sender: userInfo?.user, message: smessage }],
        }));

        setGifResults([]); // clear gifs after send
    };

    const chatMessages = messages[selectedUser?.id] || [];

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
                            onClick={() => {
                                setSelectedUser(user);
                                setUnreadCounts((prev) => {
                                    const updated = { ...prev };
                                    delete updated[user.id];
                                    return updated;
                                });
                            }}
                            className={`flex justify-between items-center p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-100 ${selectedUser?.id === user?.id ? 'bg-gray-200' : ''
                                }`}
                        >
                            <div>
                                <h3 className="font-semibold">{user?.name}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCounts[user.id] > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                        {unreadCounts[user.id]}
                                    </span>
                                )}
                                <span
                                    className={`h-3 w-3 rounded-full ${user?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                        }`}
                                ></span>
                                {/* <span className="text-sm font-medium capitalize">{user?.status}</span> */}
                            </div>
                        </div>
                        ))}


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
                                {chatMessages.map((msg, index) => (
                                    <div key={index} className="flex flex-col">

                                        <div
                                            className={`inline-flex p-2 rounded-lg ${msg?.sender?.id === userInfo?.user?.id
                                                ? 'ml-auto bg-blue-500 text-white'
                                                : 'mr-auto bg-gray-200 text-black'
                                                }`}
                                        >
                                            {/* {console.log(msg)} */}
                                            <div className="text-sm">
                                                {msg?.message?.isGif ? (
                                                    <img src={msg?.message?.text.match(/src="(.*?)"/)?.[1]} alt="gif" className="max-w-[200px] h-auto rounded" />
                                                ) : (
                                                    msg?.message?.text
                                                )}
                                            </div>
                                            {/* <div className="text-sm">{msg.message.text}</div> */}
                                        </div>
                                        <div
                                            className={`text-xs text-gray-500 mt-1 ${msg?.sender?.id === userInfo?.user?.id ? 'text-right' : 'text-left'
                                                }`}
                                        >
                                            {msg?.sender?.id === userInfo?.user?.id ? "" : msg?.sender?.name} • {new Date(msg?.message?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={message}
                                    onChange={handleInputChange}
                                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring"
                                />
                                {gifResults.length > 0 && (
                                    <div className="p-4 grid grid-cols-3 gap-3 overflow-y-auto max-h-64">
                                        {gifResults.map((gif) => (
                                            <img
                                                key={gif.id}
                                                src={gif.images.fixed_height_small.url}
                                                alt="gif"
                                                className="w-full h-auto cursor-pointer rounded hover:scale-105 transition-transform"
                                                onClick={() => handleSendGif(gif.images.fixed_height_small.url)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {!isListening ? (<button
                                    onClick={() => { SpeechRecognition.startListening({ continuous: true }); setIsListening(true); }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Start
                                </button>) : (
                                    <button
                                        onClick={handleSend}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Send
                                    </button>)}
                                <EmojiGifBox
                                    onGifSend={(url) => {
                                        handleSendGif(url); // use your existing logic
                                    }}
                                    onEmojiSelect={(emoji) => {
                                        setMessage((prev) => prev + emoji); // append emoji to input
                                    }}
                                />
                                {/* <button
                                    onClick={CallGif}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                >
                                    Load GIFs
                                </button> */}
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
