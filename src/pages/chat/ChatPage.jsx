import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
// import Input


const socket = io("http://localhost:3000");

const ChatPage = () => {
    const [message, setMessage] = useState("");
    // const [messages, setMessages] = useState([]);

    // useEffect(() => {
    //     socket.on("messageResponse", (data) => setMessages([...messages, data]));
    // }, [socket, messages]);

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

    return (
        <div class="sm:col-span-3">
            <label for="first-name" class="block text-sm/6 font-medium text-gray-900">

            </label>
            <div class="bg-gray-900 w-50 rounded-sm">
                <input id="email-address" onChange={(e) => setMessage(e.target.value)} name="email" type="email" value={message} autocomplete="email" required class="min-w-0 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" placeholder="Enter your text" />
                <button onClick={handleSendMessage} class="flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Send message</button>
            </div>
        </div>
    );
};

export default ChatPage;
