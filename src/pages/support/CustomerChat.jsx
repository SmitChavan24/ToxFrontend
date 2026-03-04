import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Headphones, Send, X, Minimize2, Paperclip, Loader2 } from "lucide-react";

const env = await import.meta.env;

const CustomerChat = () => {
    // Read config from URL params (set by widget iframe)
    const params = new URLSearchParams(window.location.search);
    const widgetMode = params.get("widget") === "true";

    const [step, setStep] = useState("intro"); // intro | chat
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [customerId, setCustomerId] = useState(null);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Clean up socket on unmount
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const startChat = (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;

        // Generate a unique customer ID
        const id = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setCustomerId(id);

        // Connect socket
        const socket = io(env.VITE_SERVER_URL, {
            transports: ["websocket"],
            query: {
                id: id,
                name: name.trim(),
                email: email.trim(),
                isCustomer: true,
            },
        });

        socket.on("connect", () => {
            setConnected(true);
            console.log("Customer connected to support!");
        });

        socket.on("receive_message", (data) => {
            setMessages((prev) => [
                ...prev,
                {
                    sender: "agent",
                    text: data?.message?.text || "",
                    timestamp: data?.message?.timestamp || new Date(),
                    isAutoReply: data?.message?.isAutoReply,
                    agentName: data?.sender?.name || "Support Agent",
                    fileUrl: data?.message?.fileUrl,
                    type: data?.message?.type,
                    isGif: data?.message?.isGif,
                },
            ]);
        });

        socket.on("disconnect", () => {
            setConnected(false);
        });

        socketRef.current = socket;
        setStep("chat");

        // Send initial greeting from system
        setMessages([
            {
                sender: "system",
                text: `Hi ${name.trim()}! 👋 You're connected to our support team. An agent will be with you shortly.`,
                timestamp: new Date(),
            },
        ]);
    };

    const sendMessage = () => {
        if (!message.trim() || !socketRef.current) return;

        const msgData = {
            text: message.trim(),
            timestamp: new Date(),
        };

        // Emit to server — the server routes this to available agents
        socketRef.current.emit("send_message", {
            toUserId: null, // server will route to available agent
            message: msgData,
            from: {
                id: customerId,
                name: name,
                email: email,
                isCustomer: true,
            },
        });

        setMessages((prev) => [
            ...prev,
            { sender: "customer", text: message.trim(), timestamp: new Date() },
        ]);
        setMessage("");
    };

    const handleFileUpload = (file) => {
        if (!file || !socketRef.current) return;
        const reader = new FileReader();
        reader.onload = () => {
            const msgData = {
                type: file.type.startsWith("video") ? "video" : "image",
                fileUrl: reader.result,
                timestamp: new Date(),
            };
            socketRef.current.emit("send_message", {
                toUserId: null,
                message: msgData,
                from: { id: customerId, name, email, isCustomer: true },
            });
            setMessages((prev) => [
                ...prev,
                { sender: "customer", fileUrl: reader.result, type: msgData.type, timestamp: new Date() },
            ]);
        };
        reader.readAsDataURL(file);
    };

    const formatTime = (ts) =>
        new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // ──────────────────────────────────────────────
    // Render
    // ──────────────────────────────────────────────
    return (
        <div
            className={`flex flex-col bg-white ${
                widgetMode ? "h-screen w-screen" : "min-h-screen"
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* Header */}
            <header className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 shrink-0 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Headphones className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white">HelpWave Support</h1>
                            <p className="text-xs text-white/70">
                                {connected ? "🟢 Connected" : step === "chat" ? "Connecting..." : "We're here to help"}
                            </p>
                        </div>
                    </div>
                    {widgetMode && (
                        <button
                            onClick={() => window.parent.postMessage("helpwave-close", "*")}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition"
                        >
                            <X className="h-4 w-4 text-white" />
                        </button>
                    )}
                </div>
            </header>

            {step === "intro" ? (
                /* ── Intro Form ── */
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="w-full max-w-sm">
                        <div className="text-center mb-8">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mx-auto mb-4">
                                <Headphones className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Hi there! 👋</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Tell us a bit about yourself so we can help you better.
                            </p>
                        </div>

                        <form onSubmit={startChat} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Jane Doe"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="jane@example.com"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] transition shadow-md shadow-indigo-500/25"
                            >
                                Start Chat
                            </button>
                        </form>

                        <p className="text-center text-xs text-gray-400 mt-6">
                            Powered by <span className="font-semibold text-indigo-500">HelpWave</span>
                        </p>
                    </div>
                </div>
            ) : (
                /* ── Chat Area ── */
                <>
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
                        {messages.map((msg, i) => {
                            if (msg.sender === "system") {
                                return (
                                    <div key={i} className="flex justify-center">
                                        <div className="px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100">
                                            <p className="text-xs text-indigo-600 font-medium">{msg.text}</p>
                                        </div>
                                    </div>
                                );
                            }

                            const isCustomer = msg.sender === "customer";
                            return (
                                <div key={i} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                                    <div className="max-w-[80%]">
                                        {!isCustomer && (
                                            <p className="text-[10px] text-gray-400 mb-0.5 px-1">
                                                {msg.isAutoReply ? "🤖 AI Assistant" : msg.agentName || "Support Agent"}
                                            </p>
                                        )}
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                                                isCustomer
                                                    ? "bg-indigo-600 text-white rounded-br-md"
                                                    : msg.isAutoReply
                                                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-bl-md"
                                                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                                            }`}
                                        >
                                            {msg.fileUrl ? (
                                                msg.type === "image" ? (
                                                    <img src={msg.fileUrl} alt="uploaded" className="max-w-full rounded-lg" />
                                                ) : (
                                                    <video src={msg.fileUrl} controls className="max-w-full rounded-lg" />
                                                )
                                            ) : msg.isGif ? (
                                                <div dangerouslySetInnerHTML={{ __html: msg.text }} className="rounded-lg overflow-hidden" />
                                            ) : (
                                                <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                                            )}
                                        </div>
                                        <p className={`text-[10px] text-gray-400 mt-1 px-1 ${isCustomer ? "text-right" : ""}`}>
                                            {formatTime(msg.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="bg-white border-t border-gray-200 px-4 py-3 shrink-0">
                        <div className="flex items-end gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="shrink-0 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition"
                            >
                                <Paperclip className="h-5 w-5" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*,video/*"
                                onChange={(e) => {
                                    if (e.target.files[0]) handleFileUpload(e.target.files[0]);
                                    e.target.value = "";
                                }}
                            />

                            <div className="flex-1 flex items-end bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition">
                                <textarea
                                    rows={1}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none max-h-24"
                                    style={{ minHeight: "20px" }}
                                />
                            </div>

                            <button
                                onClick={sendMessage}
                                disabled={!message.trim()}
                                className="shrink-0 p-2.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-gray-300 mt-2">
                            Powered by <span className="font-semibold text-indigo-400">HelpWave</span>
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default CustomerChat;
