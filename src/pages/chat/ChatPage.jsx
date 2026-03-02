import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import Profile from "../../assets/images/profile.png";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/store";
import { showNotification } from "../../screens/components/shownotification";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import {
    ArrowLeft,
    LogOut,
    Menu,
    Mic,
    MicOff,
    Paperclip,
    Search,
    Send,
    User,
    X,
} from "lucide-react";

const env = await import.meta.env;

let socket;

const ChatPage = () => {
    const navigate = useNavigate();
    const {
        userInfo,
        history,
        setHistory,
        removeUser,
        loadFromLocalStorage,
    } = useAuthStore();

    const [unreadCounts, setUnreadCounts] = useState({});
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [usersData, setUsersData] = useState([]);
    const [gifResults, setGifResults] = useState([]);
    const [messages, setMessages] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const historyRef = useRef(history);
    const selectedUserRef = useRef(selectedUser);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const checkOnlineTimerRef = useRef(null);
    const lastHistoryLengthRef = useRef(0);            // ✅ Track actual length changes

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition({
        interimResults: true,
        continuous: true,
    });

    // ──────────────────────────────────────────────
    // Effects
    // ──────────────────────────────────────────────
    useEffect(() => {
        loadFromLocalStorage();
    }, []);

    // ✅ FIX 1: Only check online when history LENGTH actually changes (new user added)
    // Uses a ref to compare previous length — prevents loops from status-only updates
    useEffect(() => {
        if (!history || history.length === 0) return;

        if (history.length !== lastHistoryLengthRef.current) {
            lastHistoryLengthRef.current = history.length;

            // Debounce to handle rapid additions
            if (checkOnlineTimerRef.current) {
                clearTimeout(checkOnlineTimerRef.current);
            }
            checkOnlineTimerRef.current = setTimeout(() => {
                checkOnlineUsers();
            }, 300);
        }

        return () => {
            if (checkOnlineTimerRef.current) {
                clearTimeout(checkOnlineTimerRef.current);
            }
        };
    }, [history]);

    // ✅ Keep refs in sync
    useEffect(() => {
        historyRef.current = history;
    }, [history]);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    useEffect(() => {
        if (transcript && transcript !== "") {
            setMessage((prev) => (prev + " " + transcript).trim());
            resetTranscript();
        }
    }, [transcript]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedUser]);

    // ✅ FIX 2: Socket connection — clean all handlers on unmount
    useEffect(() => {
        if (!userInfo?.user?.id) return;

        socket = io(env.VITE_SERVER_LURL, {
            transports: ["websocket"],
            query: { id: userInfo?.user?.id },
        });

        socket.once("connect", () => {
            console.log("Connected to socket server!");
        });

        const handleReceiveMessage = (data) => {
            const senderId = data?.sender?.id;
            const currentlyViewing = selectedUserRef.current?.id;

            // Add sender to history if not present
            if (data.sender) {
                const isInHistory = historyRef.current.some((u) => u?.id === senderId);
                if (!isInHistory) {
                    const newHistory = [...historyRef.current, data.sender];
                    setHistory(newHistory);
                    sessionStorage.setItem("Husers", JSON.stringify(newHistory));
                }
            }

            // ✅ FIX 3: Only notify + badge if NOT viewing this chat
            if (senderId !== currentlyViewing) {
                setUnreadCounts((prev) => ({
                    ...prev,
                    [senderId]: (prev[senderId] || 0) + 1,
                }));
                MNotification(data?.sender, data?.message);
            }

            setMessages((prev) => ({
                ...prev,
                [senderId]: [
                    ...(prev[senderId] || []),
                    { sender: data?.sender, message: data?.message },
                ],
            }));
        };

        const handleOnline = (userId) => {
            const currentHistory = historyRef.current;
            const userInHistory = currentHistory.find((u) => u?.id === userId);

            // ✅ FIX 4: Only update if user exists AND status actually changed
            if (userInHistory && userInHistory.status !== "online") {
                const updatedHistory = currentHistory.map((user) =>
                    user.id === userId ? { ...user, status: "online" } : user
                );
                setHistory(updatedHistory);
            }

            Notify(userId, "Online");
        };

        const handleOffline = (userId) => {
            const currentHistory = historyRef.current;
            const userInHistory = currentHistory.find((u) => u?.id === userId);

            // ✅ FIX 4: Only update if user exists AND status actually changed
            if (userInHistory && userInHistory.status !== "offline") {
                const updatedHistory = currentHistory.map((user) =>
                    user?.id === userId ? { ...user, status: "offline" } : user
                );
                setHistory(updatedHistory);
            }
        };

        socket.on("receive_message", handleReceiveMessage);
        socket.on("online", handleOnline);
        socket.on("offline", handleOffline);

        // ✅ FIX 5: Clean up ALL handlers on unmount
        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("online", handleOnline);
            socket.off("offline", handleOffline);
            socket.disconnect();
        };
    }, [userInfo?.user?.id]);

    // ──────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────

    // ✅ FIX 6: Only setHistory when statuses ACTUALLY changed
    const checkOnlineUsers = useCallback(async () => {
        try {
            const currentHistory = historyRef.current;
            if (!currentHistory || currentHistory.length === 0) return;

            const response = await axios.post(
                `${env.VITE_SERVER_LURL}online-users`,
                currentHistory,
                { headers: { "Content-Type": "application/json" } }
            );

            const { onlineUserIds } = response.data;

            const hasChanges = currentHistory.some((user) => {
                const newStatus = onlineUserIds.includes(user?.id) ? "online" : "offline";
                return user?.status !== newStatus;
            });

            if (hasChanges) {
                const updatedHistory = currentHistory.map((user) => ({
                    ...user,
                    status: onlineUserIds.includes(user?.id) ? "online" : "offline",
                }));
                setHistory(updatedHistory);
            }
        } catch (error) {
            console.error("Error checking online users:", error);
        }
    }, [setHistory]);

    const Notify = (userId, status) => {
        const user = historyRef.current.find((u) => u?.id === userId);
        const text = `👤 ${user?.name || "A user"} is now ${status}.`;
        showNotification("Hey", text);
    };

    const MNotification = (user, data) => {
        const text = `👤 ${user?.name || "A user"} has sent you a message.`;
        if (data.isGif) {
            const icon = extractGifUrlFromText(data.text);
            new Notification(text, { body: "", icon });
        } else {
            showNotification(text, data.text);
        }
    };

    const extractGifUrlFromText = (html) => {
        const match = html.match(/<img[^>]+src="([^">]+)"/);
        return match ? match[1] : "/default-icon.png";
    };

    const logoutuser = () => {
        sessionStorage.removeItem("UserInfo");
        removeUser();
        navigate("/login");
    };

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearch(value);
        if (!value.trim()) {
            setUsersData([]);
            return;
        }
        try {
            const res = await axios.get(
                `${env.VITE_SERVER_LURL}searchbyemail?email=${value}`
            );
            setUsersData(res?.data?.users || []);
        } catch {
            setUsersData([]);
        }
    };

    // ✅ FIX 7: Clean SetHistory — no setTimeout, no duplicate checkOnlineUsers
    const SetHistory = (user) => {
        setUsersData([]);
        setSelectedUser(user);
        setSearch("");

        // Clear unread for this user since we're opening their chat
        setUnreadCounts((prev) => {
            const updated = { ...prev };
            delete updated[user?.id];
            return updated;
        });

        const isUserPresent = historyRef.current.some((u) => u?.id === user?.id);
        if (!isUserPresent) {
            const newHistory = [...historyRef.current, user];
            setHistory(newHistory);
            sessionStorage.setItem("Husers", JSON.stringify(newHistory));
            // history.length changes → useEffect auto-triggers checkOnlineUsers
        }

        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const handleSend = (file = null) => {
        if (!selectedUser) return;
        const toUserId = selectedUser.id;

        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const smessage = {
                    type: file.type.startsWith("video") ? "video" : "image",
                    fileUrl: reader.result,
                    timestamp: new Date(),
                };
                socket.emit("send_message", {
                    toUserId,
                    message: smessage,
                    from: userInfo.user,
                });
                setMessages((prev) => ({
                    ...prev,
                    [toUserId]: [
                        ...(prev[toUserId] || []),
                        { sender: userInfo?.user, message: smessage },
                    ],
                }));
            };
            reader.readAsDataURL(file);
            return;
        }

        if (message.trim() === "") return;
        const smessage = { text: message, timestamp: new Date() };
        socket.emit("send_message", {
            toUserId,
            message: smessage,
            from: userInfo.user,
        });
        setMessages((prev) => ({
            ...prev,
            [toUserId]: [
                ...(prev[toUserId] || []),
                { sender: userInfo?.user, message: smessage },
            ],
        }));
        setMessage("");
    };

    const handleSendGif = (gifUrl) => {
        if (!selectedUser) return;
        const toUserId = selectedUser.id;
        const smessage = {
            text: `<img src="${gifUrl}" alt="gif" />`,
            timestamp: new Date().toISOString(),
            isGif: true,
        };
        socket.emit("send_message", {
            toUserId,
            message: smessage,
            from: userInfo?.user,
        });
        setMessages((prev) => ({
            ...prev,
            [toUserId]: [
                ...(prev[toUserId] || []),
                { sender: userInfo?.user, message: smessage },
            ],
        }));
        setGifResults([]);
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const chatMessages = messages[selectedUser?.id] || [];
    const totalUnread = Object.values(unreadCounts).reduce(
        (sum, c) => sum + c,
        0
    );

    // ──────────────────────────────────────────────
    // Render
    // ──────────────────────────────────────────────
    return (
        <div className="flex flex-col h-screen h-[100dvh] bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="md:hidden relative p-2 -ml-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
                    >
                        <Menu className="h-5 w-5 text-gray-700" />
                        {totalUnread > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {totalUnread > 9 ? "9+" : totalUnread}
                            </span>
                        )}
                    </button>
                    <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                        TOX
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                    >
                        <img
                            src={userInfo?.user?.picture || Profile}
                            alt="User"
                            className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/30"
                        />
                        <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                            {userInfo?.user?.name}
                        </span>
                    </button>
                    <button
                        onClick={logoutuser}
                        className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {isSidebarOpen && (
                    <div
                        className="md:hidden fixed inset-0 bg-black/30 z-30 transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <aside
                    className={`
                        fixed md:relative z-40 md:z-auto
                        h-[calc(100dvh-57px)] md:h-auto
                        w-[85%] max-w-[360px] md:w-80 lg:w-96
                        bg-white border-r border-gray-200
                        flex flex-col
                        transition-transform duration-300 ease-in-out
                        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                    `}
                >
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-gray-800">Chats</h2>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="md:hidden p-1 rounded-lg hover:bg-gray-100"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 ${isSearchFocused
                                ? "border-blue-500 ring-2 ring-blue-500/20 bg-white"
                                : "border-gray-200 bg-gray-50"
                                }`}
                        >
                            <Search className="h-4 w-4 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={search}
                                onChange={handleSearch}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                            />
                            {search && (
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setUsersData([]);
                                    }}
                                    className="p-0.5 rounded-full hover:bg-gray-200"
                                >
                                    <X className="h-3.5 w-3.5 text-gray-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    {usersData.filter((u) => u?.id !== userInfo?.user?.id).length > 0 && (
                        <div className="px-3 pt-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                                Search Results
                            </p>
                            {usersData
                                .filter((u) => u?.id !== userInfo?.user?.id)
                                .map((user) => (
                                    <button
                                        key={user?.id}
                                        onClick={() => SetHistory(user)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition mb-1"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                            {getInitials(user?.name)}
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {user?.name}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            <div className="border-b border-gray-100 my-2" />
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto px-3 py-2">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-6">
                                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <User className="h-8 w-8 text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-400 font-medium">No conversations yet</p>
                                <p className="text-xs text-gray-300 mt-1">Search for someone to start chatting</p>
                            </div>
                        ) : (
                            history.map((user) => {
                                const isSelected = selectedUser?.id === user?.id;
                                const unread = unreadCounts[user?.id] || 0;
                                const lastMessages = messages[user?.id];
                                const lastMsg = lastMessages?.[lastMessages.length - 1]?.message;

                                return (
                                    <button
                                        key={user?.id}
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setUnreadCounts((prev) => {
                                                const updated = { ...prev };
                                                delete updated[user?.id];
                                                return updated;
                                            });
                                            if (window.innerWidth < 768) setIsSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition mb-1 ${isSelected
                                            ? "bg-blue-50 border border-blue-200"
                                            : "hover:bg-gray-50 active:bg-gray-100 border border-transparent"
                                            }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div
                                                className={`h-11 w-11 rounded-full flex items-center justify-center text-white text-sm font-bold ${isSelected
                                                    ? "bg-gradient-to-br from-blue-600 to-violet-600"
                                                    : "bg-gradient-to-br from-gray-400 to-gray-500"
                                                    }`}
                                            >
                                                {getInitials(user?.name)}
                                            </div>
                                            <span
                                                className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white transition-colors ${user?.status === "online"
                                                    ? "bg-green-500"
                                                    : "bg-gray-300"
                                                    }`}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm truncate ${unread > 0 ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                                                    {user?.name}
                                                </p>
                                                {lastMsg?.timestamp && (
                                                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                                                        {formatTime(lastMsg.timestamp)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-0.5">
                                                <p className="text-xs text-gray-400 truncate pr-2">
                                                    {lastMsg?.isGif
                                                        ? "🎞 GIF"
                                                        : lastMsg?.fileUrl
                                                            ? "📎 Attachment"
                                                            : lastMsg?.text || (
                                                                <span className="italic">No messages yet</span>
                                                            )}
                                                </p>
                                                {unread > 0 && (
                                                    <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                        {unread > 99 ? "99+" : unread}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
                    {selectedUser ? (
                        <>
                            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0 shadow-sm">
                                <button
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setIsSidebarOpen(true);
                                    }}
                                    className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100"
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <div className="relative shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                                        {getInitials(selectedUser.name)}
                                    </div>
                                    <span
                                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${history.find((u) => u?.id === selectedUser?.id)?.status === "online"
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                            }`}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-bold text-gray-900 truncate">
                                        {selectedUser.name}
                                    </h2>
                                    <p className="text-xs text-gray-400">
                                        {history.find((u) => u?.id === selectedUser?.id)?.status === "online"
                                            ? "🟢 Online"
                                            : "Offline"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                                {chatMessages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                            <span className="text-3xl">💬</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No messages yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Say hello to {selectedUser.name}!</p>
                                    </div>
                                )}
                                {chatMessages.map((msg, index) => {
                                    const isMe = msg?.sender?.id === userInfo?.user?.id;
                                    return (
                                        <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                            <div className="max-w-[80%] sm:max-w-[65%]">
                                                <div
                                                    className={`px-4 py-2.5 rounded-2xl shadow-sm ${isMe
                                                        ? "bg-blue-600 text-white rounded-br-md"
                                                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                                                        }`}
                                                >
                                                    {msg?.message?.fileUrl ? (
                                                        msg?.message?.type === "image" ? (
                                                            <img src={msg.message.fileUrl} alt="uploaded" className="max-w-full rounded-lg" />
                                                        ) : (
                                                            <video src={msg.message.fileUrl} controls className="max-w-full rounded-lg" />
                                                        )
                                                    ) : msg?.message?.isGif ? (
                                                        <div dangerouslySetInnerHTML={{ __html: msg?.message?.text }} className="rounded-lg overflow-hidden" />
                                                    ) : (
                                                        <p className="text-sm leading-relaxed break-words">{msg?.message?.text}</p>
                                                    )}
                                                </div>
                                                <p className={`text-[10px] text-gray-400 mt-1 px-1 ${isMe ? "text-right" : "text-left"}`}>
                                                    {!isMe && <span className="font-medium">{msg?.sender?.name} • </span>}
                                                    {formatTime(msg?.message?.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="bg-white border-t border-gray-200 px-3 py-3 shrink-0">
                                <div className="flex items-end gap-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="shrink-0 p-2.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-blue-600 active:bg-gray-200 transition"
                                    >
                                        <Paperclip className="h-5 w-5" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) handleSend(file);
                                            e.target.value = "";
                                        }}
                                    />
                                    <div className="flex-1 flex items-end bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20 transition">
                                        <textarea
                                            placeholder="Type a message..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey && message.trim() !== "") {
                                                    e.preventDefault();
                                                    handleSend();
                                                }
                                            }}
                                            rows={1}
                                            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none resize-none max-h-32"
                                            style={{ height: "auto", minHeight: "20px" }}
                                            onInput={(e) => {
                                                e.target.style.height = "auto";
                                                e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
                                            }}
                                        />
                                    </div>
                                    {browserSupportsSpeechRecognition && (
                                        <button
                                            onClick={() => {
                                                if (listening) SpeechRecognition.stopListening();
                                                else SpeechRecognition.startListening({ continuous: true });
                                            }}
                                            className={`shrink-0 p-2.5 rounded-full transition ${listening
                                                ? "bg-red-100 text-red-600 animate-pulse"
                                                : "text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                                                }`}
                                        >
                                            {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={message.trim() === ""}
                                        className={`shrink-0 p-2.5 rounded-full transition shadow-sm ${message.trim()
                                            ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center mb-6">
                                <span className="text-5xl">💬</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome to TOX</h2>
                            <p className="text-sm text-gray-400 max-w-sm">
                                Select a conversation from the sidebar or search for someone to start chatting.
                            </p>
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden mt-6 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 active:scale-95 transition shadow"
                            >
                                Open Chats
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ChatPage;