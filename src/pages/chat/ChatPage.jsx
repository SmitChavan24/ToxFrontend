import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/store";
import { showNotification } from "../../screens/components/shownotification";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import {
    ArrowLeft,
    Bot,
    BotOff,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Headphones,
    Info,
    Loader2,
    LogOut,
    Menu,
    Mic,
    MicOff,
    Paperclip,
    Search,
    Send,
    Settings,
    Sparkles,
    User,
    Wand2,
    X,
    Zap,
} from "lucide-react";
import CustomerInfoPanel from "../../components/CustomerInfoPanel";
import ConversationFilters from "../../components/ConversationFilters";
import CannedResponses from "../../components/CannedResponses";

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

    // Support-specific state
    const [activeFilter, setActiveFilter] = useState("all");
    const [showCannedResponses, setShowCannedResponses] = useState(false);
    const [showCustomerInfo, setShowCustomerInfo] = useState(false);
    const [conversationMeta, setConversationMeta] = useState({}); // { [userId]: { priority, status, tags, createdAt } }

    // AI State
    const [globalAutoReply, setGlobalAutoReply] = useState(false);
    const [autoReplyUsers, setAutoReplyUsers] = useState({});
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showEnhanceMenu, setShowEnhanceMenu] = useState(false);
    const [enhancedMessage, setEnhancedMessage] = useState("");
    const [loadingEnhance, setLoadingEnhance] = useState(false);
    const [loadingAutoReply, setLoadingAutoReply] = useState(false);

    const historyRef = useRef(history);
    const selectedUserRef = useRef(selectedUser);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const checkOnlineTimerRef = useRef(null);
    const lastHistoryLengthRef = useRef(0);
    const autoReplyUsersRef = useRef(autoReplyUsers);
    const globalAutoReplyRef = useRef(globalAutoReply);
    const messagesRef = useRef(messages);

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

    useEffect(() => {
        if (!history || history.length === 0) return;
        if (history.length !== lastHistoryLengthRef.current) {
            lastHistoryLengthRef.current = history.length;
            if (checkOnlineTimerRef.current) clearTimeout(checkOnlineTimerRef.current);
            checkOnlineTimerRef.current = setTimeout(() => checkOnlineUsers(), 300);
        }
        return () => {
            if (checkOnlineTimerRef.current) clearTimeout(checkOnlineTimerRef.current);
        };
    }, [history]);

    useEffect(() => { historyRef.current = history; }, [history]);
    useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);
    useEffect(() => { autoReplyUsersRef.current = autoReplyUsers; }, [autoReplyUsers]);
    useEffect(() => { globalAutoReplyRef.current = globalAutoReply; }, [globalAutoReply]);
    useEffect(() => { messagesRef.current = messages; }, [messages]);

    useEffect(() => {
        if (transcript && transcript !== "") {
            setMessage((prev) => (prev + " " + transcript).trim());
            resetTranscript();
        }
    }, [transcript]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedUser]);

    useEffect(() => {
        setSuggestions([]);
        setShowSuggestions(false);
        setEnhancedMessage("");
        setShowEnhanceMenu(false);
        setShowCannedResponses(false);
    }, [selectedUser?.id]);

    // Initialize conversation meta for new conversations
    useEffect(() => {
        history.forEach((user) => {
            if (!conversationMeta[user?.id]) {
                setConversationMeta((prev) => ({
                    ...prev,
                    [user.id]: {
                        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                        status: 'open',
                        tags: ['support'],
                        createdAt: new Date().toLocaleDateString(),
                        messageCount: (messages[user?.id] || []).length,
                    },
                }));
            }
        });
    }, [history]);

    // Update message counts
    useEffect(() => {
        if (selectedUser?.id) {
            setConversationMeta((prev) => ({
                ...prev,
                [selectedUser.id]: {
                    ...prev[selectedUser.id],
                    messageCount: (messages[selectedUser.id] || []).length,
                },
            }));
        }
    }, [messages, selectedUser?.id]);

    // Socket connection
    useEffect(() => {
        if (!userInfo?.user?.id) return;

        socket = io(env.VITE_SERVER_URL, {
            transports: ["websocket"],
            query: { id: userInfo?.user?.id },
        });

        socket.once("connect", () => console.log("Connected to socket server!"));

        const handleReceiveMessage = (data) => {
            const senderId = data?.sender?.id;
            const currentlyViewing = selectedUserRef.current?.id;

            if (data.sender) {
                const isInHistory = historyRef.current.some((u) => u?.id === senderId);
                if (!isInHistory) {
                    const newHistory = [...historyRef.current, data.sender];
                    setHistory(newHistory);
                    sessionStorage.setItem("Husers", JSON.stringify(newHistory));
                }
            }

            if (senderId !== currentlyViewing) {
                setUnreadCounts((prev) => ({
                    ...prev,
                    [senderId]: (prev[senderId] || 0) + 1,
                }));
                MNotification(data?.sender, data?.message);
            }

            setMessages((prev) => {
                const updated = {
                    ...prev,
                    [senderId]: [
                        ...(prev[senderId] || []),
                        { sender: data?.sender, message: data?.message },
                    ],
                };
                return updated;
            });
        };

        const handleCheckAutoReply = async (data) => {
            const { senderId, senderInfo, message: incomingMsg } = data;
            if (!autoReplyUsersRef.current[senderId] && !globalAutoReplyRef.current) return;
            if (incomingMsg?.fileUrl || incomingMsg?.isGif) return;
            if (incomingMsg?.isAutoReply) return;

            try {
                setLoadingAutoReply(true);
                const currentMessages = messagesRef.current[senderId] || [];
                const response = await axios.post(
                    `${env.VITE_SERVER_URL}ai/auto-reply`,
                    {
                        incomingMessage: incomingMsg?.text || "",
                        conversationHistory: currentMessages.slice(-10),
                        userName: senderInfo?.name || "Customer",
                        myName: userInfo?.user?.name || "Support Agent",
                        senderId: senderId,
                    }
                );
                const replyText = response.data.reply;
                if (!replyText) return;
                const smessage = {
                    text: `🤖 ${replyText}`,
                    timestamp: new Date(),
                    isAutoReply: true,
                };
                socket.emit("send_message", {
                    toUserId: senderId,
                    message: smessage,
                    from: userInfo.user,
                });
                setMessages((prev) => ({
                    ...prev,
                    [senderId]: [
                        ...(prev[senderId] || []),
                        { sender: userInfo?.user, message: smessage },
                    ],
                }));
            } catch (error) {
                if (error?.response?.status === 429) {
                    console.log("Auto-reply skipped (rate limited)");
                } else {
                    console.error("Auto-reply failed:", error);
                }
            } finally {
                setLoadingAutoReply(false);
            }
        };

        const handleOnline = (userId) => {
            const currentHistory = historyRef.current;
            const userInHistory = currentHistory.find((u) => u?.id === userId);
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
            if (userInHistory && userInHistory.status !== "offline") {
                const updatedHistory = currentHistory.map((user) =>
                    user?.id === userId ? { ...user, status: "offline" } : user
                );
                setHistory(updatedHistory);
            }
        };

        socket.on("receive_message", handleReceiveMessage);
        socket.on("check_auto_reply", handleCheckAutoReply);
        socket.on("online", handleOnline);
        socket.on("offline", handleOffline);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("check_auto_reply", handleCheckAutoReply);
            socket.off("online", handleOnline);
            socket.off("offline", handleOffline);
            socket.disconnect();
        };
    }, [userInfo?.user?.id]);

    // ──────────────────────────────────────────────
    // AI Functions
    // ──────────────────────────────────────────────
    const toggleAutoReply = (userId) => {
        setAutoReplyUsers((prev) => ({
            ...prev,
            [userId]: !prev[userId],
        }));
    };

    const getSuggestions = async () => {
        if (!selectedUser) return;
        setLoadingSuggestions(true);
        setShowSuggestions(true);
        try {
            const currentMessages = messages[selectedUser.id] || [];
            const response = await axios.post(
                `${env.VITE_SERVER_URL}ai/suggestions`,
                {
                    conversationHistory: currentMessages.slice(-10),
                    userName: selectedUser.name,
                    myName: userInfo?.user?.name || "Support Agent",
                }
            );
            setSuggestions(response.data.suggestions || []);
        } catch (error) {
            if (error?.response?.status === 429) {
                setSuggestions(["⏳ AI is busy, try again in a few seconds"]);
            } else {
                setSuggestions(["❌ Failed to get suggestions"]);
            }
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const useSuggestion = (text) => {
        if (text.startsWith("⏳") || text.startsWith("❌")) return;
        setMessage(text);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const enhanceMessage = async (style) => {
        if (!message.trim()) return;
        setLoadingEnhance(true);
        try {
            const response = await axios.post(
                `${env.VITE_SERVER_URL}ai/enhance`,
                { message, style }
            );
            setEnhancedMessage(response.data.enhanced || message);
        } catch (error) {
            if (error?.response?.status === 429) {
                setEnhancedMessage("⏳ AI is busy. Please wait a moment and try again.");
            }
        } finally {
            setLoadingEnhance(false);
        }
    };

    const applyEnhanced = () => {
        if (enhancedMessage.startsWith("⏳")) return;
        setMessage(enhancedMessage);
        setEnhancedMessage("");
        setShowEnhanceMenu(false);
    };

    // ──────────────────────────────────────────────
    // Support Actions
    // ──────────────────────────────────────────────
    const resolveConversation = () => {
        if (!selectedUser) return;
        setConversationMeta((prev) => ({
            ...prev,
            [selectedUser.id]: { ...prev[selectedUser.id], status: 'resolved' },
        }));
    };

    const setPriority = (priority) => {
        if (!selectedUser) return;
        setConversationMeta((prev) => ({
            ...prev,
            [selectedUser.id]: { ...prev[selectedUser.id], priority },
        }));
    };

    // ──────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────
    const checkOnlineUsers = useCallback(async () => {
        try {
            const currentHistory = historyRef.current;
            if (!currentHistory || currentHistory.length === 0) return;
            const response = await axios.post(
                `${env.VITE_SERVER_URL}online-users`,
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
        showNotification("HelpWave", `👤 ${user?.name || "A customer"} is now ${status}.`);
    };

    const MNotification = (user, data) => {
        const text = `New message from ${user?.name || "a customer"}`;
        if (data.isGif) {
            new Notification(text, { body: "", icon: extractGifUrlFromText(data.text) });
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
        if (!value.trim()) { setUsersData([]); return; }
        try {
            const res = await axios.get(`${env.VITE_SERVER_URL}searchbyemail?email=${value}`);
            setUsersData(res?.data?.users || []);
        } catch { setUsersData([]); }
    };

    const SetHistory = (user) => {
        setUsersData([]);
        setSelectedUser(user);
        setSearch("");
        setUnreadCounts((prev) => { const u = { ...prev }; delete u[user?.id]; return u; });
        const isUserPresent = historyRef.current.some((u) => u?.id === user?.id);
        if (!isUserPresent) {
            const newHistory = [...historyRef.current, user];
            setHistory(newHistory);
            sessionStorage.setItem("Husers", JSON.stringify(newHistory));
        }
        if (window.innerWidth < 768) setIsSidebarOpen(false);
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
                socket.emit("send_message", { toUserId, message: smessage, from: userInfo.user });
                setMessages((prev) => ({
                    ...prev,
                    [toUserId]: [...(prev[toUserId] || []), { sender: userInfo?.user, message: smessage }],
                }));
            };
            reader.readAsDataURL(file);
            return;
        }

        if (message.trim() === "") return;
        const smessage = { text: message, timestamp: new Date() };
        socket.emit("send_message", { toUserId, message: smessage, from: userInfo.user });
        setMessages((prev) => ({
            ...prev,
            [toUserId]: [...(prev[toUserId] || []), { sender: userInfo?.user, message: smessage }],
        }));
        setMessage("");
        setEnhancedMessage("");
        setShowEnhanceMenu(false);
        setSuggestions([]);
        setShowSuggestions(false);
        setShowCannedResponses(false);
    };

    const handleSendGif = (gifUrl) => {
        if (!selectedUser) return;
        const toUserId = selectedUser.id;
        const smessage = { text: `<img src="${gifUrl}" alt="gif" />`, timestamp: new Date().toISOString(), isGif: true };
        socket.emit("send_message", { toUserId, message: smessage, from: userInfo?.user });
        setMessages((prev) => ({
            ...prev,
            [toUserId]: [...(prev[toUserId] || []), { sender: userInfo?.user, message: smessage }],
        }));
        setGifResults([]);
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    // ──────────────────────────────────────────────
    // Filtered conversations
    // ──────────────────────────────────────────────
    const filteredHistory = history.filter((user) => {
        if (activeFilter === 'all') return true;
        const meta = conversationMeta[user?.id];
        return meta?.status === activeFilter;
    });

    const filterCounts = {
        all: history.length,
        open: history.filter((u) => conversationMeta[u?.id]?.status === 'open').length,
        pending: history.filter((u) => conversationMeta[u?.id]?.status === 'pending').length,
        resolved: history.filter((u) => conversationMeta[u?.id]?.status === 'resolved').length,
    };

    const chatMessages = messages[selectedUser?.id] || [];
    const totalUnread = Object.values(unreadCounts).reduce((sum, c) => sum + c, 0);

    const enhanceStyles = [
        { label: "Professional", value: "professional", icon: "💼" },
        { label: "Empathetic", value: "friendly", icon: "💛" },
        { label: "Concise", value: "formal", icon: "✂️" },
        { label: "Detailed", value: "casual", icon: "📋" },
    ];

    const priorityOptions = [
        { value: 'high', label: '🔴 High', color: 'text-red-600' },
        { value: 'medium', label: '🟡 Medium', color: 'text-amber-600' },
        { value: 'low', label: '🟢 Low', color: 'text-green-600' },
    ];

    // ──────────────────────────────────────────────
    // Render
    // ──────────────────────────────────────────────
    return (
        <div className="flex flex-col h-screen h-[100dvh] bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Top Nav */}
            <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden relative p-2 -ml-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition">
                        <Menu className="h-5 w-5 text-gray-700" />
                        {totalUnread > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {totalUnread > 9 ? "9+" : totalUnread}
                            </span>
                        )}
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                            <Headphones className="h-4 w-4 text-white" />
                        </div>
                        <h1 className="text-lg font-bold tracking-tight text-gray-900">HelpWave</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Global Auto-Reply Toggle */}
                    <button
                        onClick={() => setGlobalAutoReply(!globalAutoReply)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${globalAutoReply
                                ? 'bg-violet-50 text-violet-700 border-violet-200'
                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                            }`}
                        title={globalAutoReply ? 'Auto-Reply is ON for all conversations' : 'Turn ON auto-reply for all conversations'}
                    >
                        <Bot className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{globalAutoReply ? 'Bot ON' : 'Bot OFF'}</span>
                    </button>
                    <button onClick={() => navigate("/profile")} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(userInfo?.user?.name)}
                        </div>
                        <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">{userInfo?.user?.name}</span>
                    </button>
                    <button onClick={logoutuser} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition" title="Logout">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar overlay */}
                {isSidebarOpen && (
                    <div className="md:hidden fixed inset-0 bg-black/30 z-30 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
                )}

                {/* Sidebar */}
                <aside className={`fixed md:relative z-40 md:z-auto h-[calc(100dvh-49px)] md:h-auto w-[85%] max-w-[360px] md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                    <div className="p-3 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-base font-bold text-gray-800">Conversations</h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 rounded-lg hover:bg-gray-100">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${isSearchFocused ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-white" : "border-gray-200 bg-gray-50"}`}>
                            <Search className="h-4 w-4 text-gray-400 shrink-0" />
                            <input type="text" placeholder="Search customers..." value={search} onChange={handleSearch} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)} className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" />
                            {search && (
                                <button onClick={() => { setSearch(""); setUsersData([]); }} className="p-0.5 rounded-full hover:bg-gray-200">
                                    <X className="h-3.5 w-3.5 text-gray-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="border-b border-gray-100">
                        <ConversationFilters
                            activeFilter={activeFilter}
                            onFilterChange={setActiveFilter}
                            counts={filterCounts}
                        />
                    </div>

                    {/* Search Results */}
                    {usersData.filter((u) => u?.id !== userInfo?.user?.id).length > 0 && (
                        <div className="px-3 pt-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Search Results</p>
                            {usersData.filter((u) => u?.id !== userInfo?.user?.id).map((user) => (
                                <button key={user?.id} onClick={() => SetHistory(user)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 active:bg-indigo-100 transition mb-1">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">{getInitials(user?.name)}</div>
                                    <div className="text-left min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>
                                </button>
                            ))}
                            <div className="border-b border-gray-100 my-2" />
                        </div>
                    )}

                    {/* Conversation History */}
                    <div className="flex-1 overflow-y-auto px-2 py-2">
                        {filteredHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-6">
                                <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                    <User className="h-7 w-7 text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-400 font-medium">
                                    {activeFilter === "all" ? "No conversations yet" : `No ${activeFilter} conversations`}
                                </p>
                                <p className="text-xs text-gray-300 mt-1">New conversations will appear here</p>
                            </div>
                        ) : (
                            filteredHistory.map((user) => {
                                const isSelected = selectedUser?.id === user?.id;
                                const unread = unreadCounts[user?.id] || 0;
                                const lastMessages = messages[user?.id];
                                const lastMsg = lastMessages?.[lastMessages.length - 1]?.message;
                                const isAutoReplyOn = autoReplyUsers[user?.id];
                                const meta = conversationMeta[user?.id] || {};
                                const priorityDot = { high: 'bg-red-500', medium: 'bg-amber-400', low: 'bg-green-500' };

                                return (
                                    <div key={user?.id} className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition mb-0.5 ${isSelected ? "bg-indigo-50 border border-indigo-200" : "hover:bg-gray-50 active:bg-gray-100 border border-transparent"}`}>
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setUnreadCounts((prev) => { const u = { ...prev }; delete u[user?.id]; return u; });
                                                if (window.innerWidth < 768) setIsSidebarOpen(false);
                                            }}
                                            className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                                        >
                                            <div className="relative shrink-0">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${isSelected ? "bg-gradient-to-br from-indigo-600 to-violet-600" : "bg-gradient-to-br from-gray-400 to-gray-500"}`}>
                                                    {getInitials(user?.name)}
                                                </div>
                                                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white transition-colors ${user?.status === "online" ? "bg-green-500" : "bg-gray-300"}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${priorityDot[meta?.priority] || 'bg-gray-300'}`} />
                                                    <p className={`text-sm truncate ${unread > 0 ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>{user?.name}</p>
                                                    {lastMsg?.timestamp && <span className="text-[10px] text-gray-400 shrink-0 ml-auto">{formatTime(lastMsg.timestamp)}</span>}
                                                </div>
                                                <div className="flex items-center justify-between mt-0.5 pl-3">
                                                    <p className="text-xs text-gray-400 truncate pr-2">
                                                        {lastMsg?.isAutoReply ? "🤖 Auto-reply" : lastMsg?.isGif ? "🎞 GIF" : lastMsg?.fileUrl ? "📎 Attachment" : lastMsg?.text || <span className="italic">No messages yet</span>}
                                                    </p>
                                                    {unread > 0 && <span className="shrink-0 min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread > 99 ? "99+" : unread}</span>}
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleAutoReply(user?.id); }}
                                            className={`shrink-0 p-1.5 rounded-lg transition ${isAutoReplyOn ? "bg-violet-100 text-violet-600" : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"}`}
                                            title={isAutoReplyOn ? "Auto-reply ON" : "Auto-reply OFF"}
                                        >
                                            {isAutoReplyOn ? <Bot className="h-3.5 w-3.5" /> : <BotOff className="h-3.5 w-3.5" />}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* Chat Window */}
                <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => { setSelectedUser(null); setIsSidebarOpen(true); }} className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100">
                                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                                    </button>
                                    <div className="relative shrink-0">
                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold">{getInitials(selectedUser.name)}</div>
                                        <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${history.find((u) => u?.id === selectedUser?.id)?.status === "online" ? "bg-green-500" : "bg-gray-300"}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-sm font-bold text-gray-900 truncate">{selectedUser.name}</h2>
                                        <p className="text-xs text-gray-400">
                                            {history.find((u) => u?.id === selectedUser?.id)?.status === "online" ? "🟢 Online" : "Offline"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Priority selector */}
                                    <select
                                        value={conversationMeta[selectedUser?.id]?.priority || 'medium'}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 outline-none focus:border-indigo-300 cursor-pointer"
                                    >
                                        {priorityOptions.map((p) => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>

                                    {/* Resolve button */}
                                    {conversationMeta[selectedUser?.id]?.status !== 'resolved' && (
                                        <button
                                            onClick={resolveConversation}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition border border-green-200"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Resolve
                                        </button>
                                    )}
                                    {conversationMeta[selectedUser?.id]?.status === 'resolved' && (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium border border-green-200">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                                        </span>
                                    )}

                                    {/* Auto-reply indicator */}
                                    {autoReplyUsers[selectedUser?.id] && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-50 rounded-lg border border-violet-200">
                                            <Bot className="h-3.5 w-3.5 text-violet-600" />
                                            <span className="text-[11px] font-medium text-violet-600">Auto-Reply</span>
                                        </div>
                                    )}

                                    {/* Customer info toggle */}
                                    <button
                                        onClick={() => setShowCustomerInfo(!showCustomerInfo)}
                                        className={`p-2 rounded-lg transition ${showCustomerInfo ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                                        title="Customer info"
                                    >
                                        <Info className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Chat + Info layout */}
                            <div className="flex flex-1 overflow-hidden">
                                {/* Messages area */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                                        {chatMessages.length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-full text-center">
                                                <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                                                    <span className="text-2xl">💬</span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-500">No messages yet</p>
                                                <p className="text-xs text-gray-400 mt-1">Start the conversation with {selectedUser.name}</p>
                                            </div>
                                        )}
                                        {chatMessages.map((msg, index) => {
                                            const isMe = msg?.sender?.id === userInfo?.user?.id;
                                            const isAutoReply = msg?.message?.isAutoReply;
                                            return (
                                                <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                                    <div className="max-w-[80%] sm:max-w-[65%]">
                                                        <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${isAutoReply
                                                            ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-md"
                                                            : isMe
                                                                ? "bg-indigo-600 text-white rounded-br-md"
                                                                : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                                                            }`}>
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
                                                            {isAutoReply && <span className="font-medium">🤖 Auto • </span>}
                                                            {!isMe && !isAutoReply && <span className="font-medium">{msg?.sender?.name} • </span>}
                                                            {formatTime(msg?.message?.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* AI Suggestions Panel */}
                                    {showSuggestions && (
                                        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border-t border-violet-200 px-4 py-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                                                    <span className="text-xs font-semibold text-violet-700">Smart Replies</span>
                                                </div>
                                                <button onClick={() => { setShowSuggestions(false); setSuggestions([]); }} className="p-0.5 rounded hover:bg-violet-100">
                                                    <X className="h-3.5 w-3.5 text-violet-400" />
                                                </button>
                                            </div>
                                            {loadingSuggestions ? (
                                                <div className="flex items-center gap-2 py-2">
                                                    <Loader2 className="h-4 w-4 text-violet-500 animate-spin" />
                                                    <span className="text-xs text-violet-500">Generating suggestions...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {suggestions.map((s, i) => (
                                                        <button key={i} onClick={() => useSuggestion(s)} className="px-3 py-1.5 bg-white border border-violet-200 rounded-full text-xs text-gray-700 hover:bg-violet-100 hover:border-violet-300 active:scale-95 transition shadow-sm">
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Enhance Preview */}
                                    {enhancedMessage && (
                                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Wand2 className="h-3.5 w-3.5 text-amber-600" />
                                                    <span className="text-xs font-semibold text-amber-700">Enhanced Version</span>
                                                </div>
                                                <button onClick={() => setEnhancedMessage("")} className="p-0.5 rounded hover:bg-amber-100">
                                                    <X className="h-3.5 w-3.5 text-amber-400" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2 bg-white rounded-lg px-3 py-2 border border-amber-200">{enhancedMessage}</p>
                                            <div className="flex gap-2">
                                                <button onClick={applyEnhanced} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 active:scale-95 transition">
                                                    Use This
                                                </button>
                                                <button onClick={() => setEnhancedMessage("")} className="px-3 py-1.5 bg-white text-gray-600 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 transition">
                                                    Keep Original
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Enhance Style Menu */}
                                    {showEnhanceMenu && !enhancedMessage && (
                                        <div className="bg-white border-t border-gray-200 px-4 py-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Wand2 className="h-3.5 w-3.5 text-gray-600" />
                                                    <span className="text-xs font-semibold text-gray-600">Choose tone</span>
                                                </div>
                                                <button onClick={() => setShowEnhanceMenu(false)} className="p-0.5 rounded hover:bg-gray-100">
                                                    <X className="h-3.5 w-3.5 text-gray-400" />
                                                </button>
                                            </div>
                                            {loadingEnhance ? (
                                                <div className="flex items-center gap-2 py-2">
                                                    <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                                                    <span className="text-xs text-indigo-500">Enhancing your message...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {enhanceStyles.map((style) => (
                                                        <button key={style.value} onClick={() => enhanceMessage(style.value)} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 active:scale-95 transition">
                                                            {style.icon} {style.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Canned Responses */}
                                    {showCannedResponses && (
                                        <CannedResponses
                                            onSelect={(text) => { setMessage(text); setShowCannedResponses(false); }}
                                            onClose={() => setShowCannedResponses(false)}
                                        />
                                    )}

                                    {/* Input Bar */}
                                    <div className="bg-white border-t border-gray-200 px-3 py-2.5 shrink-0">
                                        <div className="flex items-end gap-2">
                                            {/* Attach */}
                                            <button onClick={() => fileInputRef.current?.click()} className="shrink-0 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-indigo-600 active:bg-gray-200 transition">
                                                <Paperclip className="h-5 w-5" />
                                            </button>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => { if (e.target.files[0]) handleSend(e.target.files[0]); e.target.value = ""; }} />

                                            {/* Canned responses */}
                                            <button onClick={() => setShowCannedResponses(!showCannedResponses)} className={`shrink-0 p-2 rounded-full transition ${showCannedResponses ? 'bg-amber-50 text-amber-600' : 'text-gray-400 hover:bg-gray-100 hover:text-amber-600'}`} title="Quick replies">
                                                <Zap className="h-5 w-5" />
                                            </button>

                                            {/* Message input */}
                                            <div className="flex-1 flex items-end bg-gray-50 rounded-2xl border border-gray-200 px-3 py-2 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition">
                                                <textarea
                                                    rows={1}
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                                    placeholder="Type a reply..."
                                                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none max-h-32"
                                                    style={{ minHeight: "24px" }}
                                                />
                                            </div>

                                            {/* AI buttons */}
                                            <button onClick={getSuggestions} className="shrink-0 p-2 rounded-full text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition" title="Smart replies">
                                                <Sparkles className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => { if (message.trim()) setShowEnhanceMenu(!showEnhanceMenu); }} className={`shrink-0 p-2 rounded-full transition ${showEnhanceMenu && message.trim() ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-100 hover:text-indigo-600'}`} title="Enhance message">
                                                <Wand2 className="h-5 w-5" />
                                            </button>

                                            {/* Voice */}
                                            {browserSupportsSpeechRecognition && (
                                                <button
                                                    onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening({ continuous: true })}
                                                    className={`shrink-0 p-2 rounded-full transition ${listening ? "bg-red-50 text-red-500" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
                                                    title={listening ? "Stop recording" : "Voice input"}
                                                >
                                                    {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                                </button>
                                            )}

                                            {/* Send */}
                                            <button
                                                onClick={() => handleSend()}
                                                disabled={!message.trim()}
                                                className="shrink-0 p-2.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                            >
                                                <Send className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info Panel */}
                                {showCustomerInfo && (
                                    <CustomerInfoPanel
                                        customer={selectedUser}
                                        conversationMeta={conversationMeta[selectedUser?.id]}
                                        onClose={() => setShowCustomerInfo(false)}
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                        /* Empty state */
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-6">
                                <Headphones className="h-12 w-12 text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome to HelpWave</h2>
                            <p className="text-sm text-gray-400 max-w-sm">
                                Select a conversation from the sidebar to start helping your customers, or wait for new incoming chats.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ChatPage;